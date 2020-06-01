#include <eosio/eosio.hpp>

using namespace eosio;

CONTRACT registry : public contract {
  public:
    using contract::contract;

    ACTION updatedid(name owner, checksum256 ddoHash);
    
  private:
  //scope is owner
    TABLE records {
      name    owner;
      checksum256 ddoHash;
      auto primary_key() const { return owner.value; }
    };
    using records_index = multi_index<"records"_n, records>;
};