/* global window */
import verifyChainId from '../utils/verifyChainId';
import AbstractWeb3Connector from './AbstractWeb3Connector';
import { ConnectorEvents } from './events';
import { getMoralisRpcs } from './MoralisRpcs';
import { ethers } from 'ethers';

export const WalletConnectEvent = Object.freeze({
  ACCOUNTS_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
  DISCONNECT: 'disconnect',
});

class WalletConnectWeb3Connector extends AbstractWeb3Connector {
  type = 'magicConnect';

  async activate({ apiKey, network, email } = {}) {
    // Intitalize MagicConnect
    let Magic;
    try{
        Magic = require("magic-sdk")?.default;
        Magic = Magic.Magic
    }catch(err){

    }
    //   Initalize Provider
    const magic = new Magic(apiKey, {
        network: network
      });
    this.provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    const accounts = await magic.auth.loginWithMagicLink({ email });

    const { chainId } = this.provider;
    const verifiedChainId = verifyChainId(chainId);

    this.account = await magic.user.getMetaData();
    this.chainId = verifiedChainId;

    this.subscribeToEvents(this.provider);

    return { provider: this.provider, account, chainId: verifiedChainId };
}
    async deactivate() {
        this.unsubscribeToEvents(this.provider);
        try {
        if (window) {
            window.localStorage.removeItem('magicConnect');
        }
        } catch (error) {
        // Do nothing
        }

        this.account = null;
        this.chainId = null;

        await this.provider.disconnect();
    }

}

export default WalletConnectWeb3Connector;
