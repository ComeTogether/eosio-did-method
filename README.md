# eosio-did-method
The specification of the EOSIO DID-method.
Vo.1, Stavros Antoniadis & Andreas Kouloumos, ComeTogether
## Introduction
### EOSIO
EOSIO description
### IPFS
IPFS is a distributed, cryptographic Content-Addressable Storage (CAS) network. IPFS enables distributed storage of content over a network with the content being addressable via its hash. An important concept to note is that if data changes, so does it's address.

## Method DID Format
EOSIO DIDs are identifiable by their `eosio` method string and conform to the [Generic DID Scheme](https://w3c-ccg.github.io/did-spec/#the-generic-did-scheme).

A DID that uses this method MUST begin with the following prefix: `did:eosio:`. Per the DID specification, this string 
MUST be in lowercase. The remainder of the DID, after the prefix, is specified below:

        eosio-did = "did:eosio:" eosio-specific-idstring
        eosio-specific-idstring = [ eosio-network ":" ] eosio-account-name
        eosio-network = "mainnet" / "kylin" / "jungle" / "telos"
        eosio-account-name = *as specified by the EOSIO blockchain software*


## Method CRUD Operations
### Create / Register
In order to create an EOSIO DID, an account on a supported EOSIO blockchain must exist. At the moment there are numerous processes for the creation of such an account. EOSIO account creation is outside the scope of this document.

The account that will control the DID has to invoke the corresponding `updatedid()` action of the registy smart-contract to create the mapping from the DID to the IPFS address where the DID Document is stored. Only the account that will send this initial transaction can be the owner of the newly created DID. 
### Read / Resolve
DID Document resolution is achieved by querying the registry smart-contract with a DID. If that DID is registered, an IPFS address will be returned. Otherwise, an empty address is returned. This IPFS address can then be resolved through IPFS to the DID Document.
### Updating and Deactivate
IPFS addresses are hashes of their content, so an updated DID Document will also have a new IPFS address. So updating  uses again the same `updatedid()` action of the registy smart-contract with the same DID and the new IPFS hash of the updated DID Document. 

A DID can be deactivated by updating the registry, as mentioned above, to return an all-0 byte string, as if it had never been initialised.




## Key Management
### Key Recovery
Writing to the eosio registry mapping contract requires control over the eosio account used to register the DID, so any account recovery method which applies to eosio accounts can be applied here. 
### Key Revocation
There is no centralised control of the registry contract, hence no entity can revoke the keys of DID control of another entity.
## Privacy and Security Considerations
### Key Control
As mentioned in the Key Recovery section, the entity which controls the account which registers the DID also effectively controls the DID Document which the DID resolves to. Thus great care should be taken to ensure that the private key of the account is kept private. Methods for ensuring key privacy are outside the scope of this document.
### DID Document Public Profile
The DID Document addressed by the registry contract can contain any content, though it is recommended that it conforms to the [W3C DID Document Specificaiton](https://w3c-ccg.github.io/did-spec/#did-documents). As registered DIDs can be resolved by anyone, care should be taken to only update the registry to resolve to DID Documents which DO NOT expose any sensitive personal information, or information which you may not wish to be public.
### IPFS and Cannonicity
IPFS allows any entity to store content publically. A common misconception is that anyone can edit content, however the content-addressability of the platform means that this new content will have a different address to the original. Thus while any entity can copy and modify an anchored DID Document, they cannot change the document that a DID resolves to via the registry smartcontract unless they control the private key which anchored it.

