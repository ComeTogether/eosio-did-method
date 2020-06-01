 
import RegistryContract from "eosio-did-registry-contract";
import { Ipfs } from "./ipfs";
import { IDidDocument } from "@decentralized-identity/did-common-typescript"

const COVID19_CERT_TYPE = "Covid19TestsResults"
export const jungle_api =  'https://jungle2.cryptolions.io:443'
export const cometogetherIpfsHost = 'https://cometogeher.com:443'

export function getRegistry(providerUrl: string = jungle_api ,ipfsHost: string = cometogetherIpfsHost) {
    const registryContract = new RegistryContract(providerUrl)
    const ipfs = new Ipfs(ipfsHost)
    return (
        async (privateKeyHex: string, didDocument: IDidDocument, covid19Results?: any): Promise<IDidDocument> => {
                        let covid19Section;
                        let profileServiceIndex : number | undefined;
                        if (didDocument.service)
                            profileServiceIndex = didDocument.service.findIndex(s => s.type === COVID19_CERT_TYPE)

                        if (covid19Results) {
                            const profileHash = await ipfs.storeDocument(covid19Results)
                            covid19Section = generateCovid19ServiceSection(didDocument.id, profileHash)
                            if (!didDocument.service)
                            didDocument.service = []
                            if (profileServiceIndex === -1 || profileServiceIndex === undefined)
                            didDocument.service.push(covid19Results)
                            else
                            didDocument.service[profileServiceIndex] = covid19Section;
                        } else {
                            // @ts-ignore
                            if ( profileServiceIndex > -1)
                                // @ts-ignore
                                didDocument.service?.splice(profileServiceIndex, 1)
                        }

                        const documentHash = await ipfs.storeDocument(didDocument)

                        await registryContract.updateDID([privateKeyHex], didDocument.id, documentHash)
                        return didDocument
            }
    )
}


/**
 * Instantiates the {@link ServiceEndpointsSection} class based on passed arguments
 * @param did - The did of the did document owner
 * @param profileIpfsHash - IPFS hash that can be used to dereference the public profile credential
 * @internal
 */

function generateCovid19ServiceSection(
  did: string,
  profileIpfsHash: string,
) {
  return {
    id: `${ did }`,
    serviceEndpoint: `ipfs://${ profileIpfsHash }`,
    description: 'Verifiable Credential for covid-19 tests results',
    type: COVID19_CERT_TYPE,
  }
}