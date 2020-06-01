import { Api, JsonRpc, RpcError } from 'eosjs';
import isNode from "detect-node";
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';      // development only
import fetch from 'node-fetch'; 

const CONTRACT_NAME = "didregistry1";
const TABLE_NAME = "records";
//const ACTION_REGISTER_NAME = "registerdid"
const ACTION_UPDATE_NAME = "updatedid";

const ddoc = (account_name : string ) => ({
    json: true,              // Get the response as json
    code: CONTRACT_NAME,     // Contract that we target
    scope: account_name,         // Account that owns the data
    table: TABLE_NAME,        // Table name
    limit: 1               // Maximum number of rows that we want to get
})

const update_action = (account_name : string , action_name : string, didDocumentHash : string) => (
    {   
        actions: [{
            account: CONTRACT_NAME,
            name: action_name,
            authorization: [{
            actor: account_name,
            permission: 'active',
            }],
            data: {
            owner: account_name,
            ddoHash: didDocumentHash
            },
        }]
    }
)  

const trx_prop = { blocksBehind: 3, expireSeconds: 30};   


export default class RegistryContract {
    private readonly rpc;
    public fetchImplementation = isNode ? fetch : window.fetch;

    
    constructor( provider: string ){
        this.rpc = new JsonRpc(provider, {fetch});
    }

   /**
   * Resolves a DID on Registry Contract. Checks if the DID exists to the table of the contract and returns the correlated IPFS hash.
   * @param did -  the DID that should be resolved
   * @returns The IPFS hash if an entry exists for the given DID
   * @throws if the DID method is not "eosio" or if no entry exists in the contracts' table
   * @example registryContract.resolveDID("did:eosio:{account_name}")
   */

   async resolveDID (did: string) : Promise<string> {
        const account_name = extractMethodPrefix(did);
        return await this.rpc.get_table_rows(ddoc(account_name))
   }

   /**
   * Updates the mapping between a DID and a IPFS hash in the registry contract on ethereum. Creates an entry if there is non.
   * @param privateKey -  the key to sign thpinatae ethereum transaction with
   * @param did - the user's DID
   * @param didDocumentHash - IPFS hash of the related DID Document
   * @example registryContract.updateDID( ["privkey1"], "did:eosio:{account_name}", "bafybeidtd6fssleg4xnkwwvucn72sb4o3m2pmai6eu5dmspf7myy6v4hdm" )
   */
  async updateDID( privateKey : string [], did: string, didDocumentHash: string): Promise<void> {    
    const account_name = extractMethodPrefix(did)

    const signatureProvider = new JsSignatureProvider(privateKey)
    const api = new Api({rpc:this.rpc, signatureProvider: signatureProvider})
    try{
      const trx = await api.transact(update_action(account_name, ACTION_UPDATE_NAME , didDocumentHash), trx_prop)
      await trx.wait();    
    }
    catch(e){
      if(e instanceof RpcError){
        console.log(JSON.stringify(e.json, null, 2));
      }
    }
  }

}

function extractMethodPrefix(did: string) {
    if (did.indexOf('eosio') === -1)
      throw 'Only "eosio" DIDs are allowed'
    return `${ did.substring(did.lastIndexOf(':') + 1) }`
  }