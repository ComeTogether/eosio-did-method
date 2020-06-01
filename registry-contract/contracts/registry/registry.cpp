#include <registry.hpp>

ACTION registry::updatedid(name owner, checksum256 ddoHash) {
    require_auth(owner);

    records_index records_table(get_self(), owner.value );
    auto records_itr = records_table.find(owner.value);
    //No DID registered for this account -> New DID is registered
    if (records_itr == records_table.end()) {
        records_table.emplace( get_self(), [&]( auto& record ){
            record.owner = owner;
            record.ddoHash = ddoHash;
        });
    } 
    // DID has been registered for this account -> Updating DID
    else {
        records_table.modify(records_itr, get_self(), [&]( auto& record ){
            record.owner = owner;
            record.ddoHash = ddoHash;
    });
    }    
}