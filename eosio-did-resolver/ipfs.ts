import axios from 'axios';

/**
 * @class
 * Class abstracting all interactions with ipfs nodes
 * @internal
 */
export class Ipfs {
  private readonly _endpoint: string

  /**
   * Creates an instance of {@link Ipfs}
   * @param host - Remote ipfs gateway url
   * @example `const ipfs = new Ipfs('https://cometogether.com:443')`
   */

  constructor(host: string) {
    this._endpoint = host
  }

  /**
   * Dereferences an IPFS hash and parses the result as json
   * @param hash - IPFS hash
   * @example `console.log(await Ipfs.catJSON('QmZC...')) // {test: 'test'}`
   */

  public async derefJSON(hash: string): Promise<object> {
    const endpoint = `${ this._endpoint }/api/ipfs/cat${ hash }`
    const res = await this.getRequest(endpoint)
    return res.data.json()
  }

  /**
   * Helper method to get data using correct fetch implementation
   * @param endpoint - HTTP endpoint to get data from
   */

  private async getRequest(endpoint: string) {
    return axios({
        method: 'get',
        url: endpoint
    })
  }
}