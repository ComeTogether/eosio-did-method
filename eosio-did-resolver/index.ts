import { DIDDocument, ParsedDID, Resolver } from "did-resolver";
import RegistryContract from "eosio-did-registry-contract";
import { Ipfs } from "./ipfs";

const PROVIDER_URI = 'https://jungle2.cryptolions.io:443';
const IPFS_ENDPOINT = 'https://eosio.ipfs.com:443'

export function getResolver(providerUri: string = PROVIDER_URI, ipfsHost: string = IPFS_ENDPOINT) {
  const registryContract = new RegistryContract(providerUri)
  const ipfsAgent = new Ipfs(ipfsHost)

  async function resolve(
    did: string
  ): Promise<DIDDocument | null> {
    const ipfsHash = await registryContract.resolveDID(did);

    if (ipfsHash) return (await ipfsAgent.derefJSON(ipfsHash)) as DIDDocument;
    return null
  }

  return { "eosio": resolve }
}