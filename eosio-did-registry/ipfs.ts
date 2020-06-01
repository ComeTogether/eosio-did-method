import FormData from "form-data";
import axios from 'axios';
import isNode from 'detect-node';

/**
* @class
* Class abstracting all interactions with ipfs nodes
* @internal
*/
export class Ipfs {
    private readonly _endpoint : string;

    /**
     * Creates an instance of {@link Ipfs}
     * @param host - Remote ipfs gateway url
     * @example `const ipfs = new Ipfs('https://eosio.ipfs.com:443')`
     */

    constructor( host: string){
        this._endpoint = host;
    }

   /**
   * Stores a DID JSON document on IPFS, using a public gateway
   * @param data - JSON document to store
   * @param pin - Whether the hash should be added to the pinset
   * @returns {string} - IPFS hash
   * @example `await ipfsAgent.storeDocument({data: {test: 'test'}, pin: false})`
   */

   public async storeDocument(data: object, pin :boolean = true) {
       const endpoint = `${this._endpoint}/api/ipfs/add?pin=${pin}`

       const serializedData = serializeDID(data)
       const { Hash } = await this.postRequest(endpoint, serializedData).then(
        res => res.data.json()
      )
      return Hash
        
   }

   /**
   * Removes the specified hash from the pinset
   * @param IPFShash - IPFS hash
   * @example `await ipfsAgent.removePinnedHash('QmZC...')`
   */

  public async removePinnedHash(IPFShash: string): Promise<void> {
    const endpoint = `${ this._endpoint }/api/ipfs/rm?arg=${ IPFShash }`
    const res = await this.getRequest(endpoint)

    if (res.statusText != 'OK' ) {
      throw new Error(
        `Removing pinned hash ${ IPFShash } failed, status code: ${ res.status }`,
      )
    }
  }

  /**
   * Helper function to post data via requests 
   * @param endpoint - the HTTP endpoint to post the data
   * @param data - the actual data - DID document that we want to post
   */

   private async postRequest( endpoint : string, data : any) {
    return axios({
        method: 'post',
        url: endpoint,
        data: data,
        // if we use pinata : https://pinata.cloud/documentation#PinJSONToIPFS
        // headers: {
        //     'pinata_api_key': pinataApiKey,
        //     'pinata_secret_api_key': pinataSecretApiKey
        // }
    })
   }

   /**
   * Helper function to get data via requests 
   * @param endpoint - the HTTP endpoint to get the data
   */

   private async getRequest( endpoint : string) {
    return axios({
        method: 'get',
        url: endpoint
    })
   }
}

/** 
 * Helper method to serialize 
 * 
*/

export function serializeDID(data: object) {
    if(!data || typeof data != 'object'){
        throw new Error(` JSON expected, received ${ typeof data }`);
    }

    const formJSON = new FormData();
    if( isNode ){
        formJSON.append('document', Buffer.from(JSON.stringify(data)));
        return formJSON;
    }
    else {
        const serializeData = Buffer.from(JSON.stringify(data).toString())

        const blob = new Blob([serializeData], {});

        formJSON.append('document', blob);
        return formJSON;
    }


}