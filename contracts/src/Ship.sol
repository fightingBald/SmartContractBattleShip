// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import 'hardhat/console.sol';

abstract contract Ship {
  function update(uint x, uint y) public virtual;
  function fire() public virtual returns (uint, uint);
  function place(uint width, uint height) public virtual returns (uint, uint);
}



contract MyShip is Ship{

    uint public x;
    uint public y;

    constructor(uint _x, uint _y) public {
        x = _x;
        y = _y;
        console.log("The Consructor is calling by the account%s", msg.sender);
      
    }
   

   function update(uint _x, uint _y) public override{
      x= _x;
      y = _y;
   }
  function fire() public override returns (uint x, uint y){
     x = 1;
     y = 1;
  }
  function place(uint width, uint height) public override returns (uint cord_x, uint cord_y){
    console.log("The Place function is calling by the account%s", msg.sender);
    cord_x = x;
    cord_y = y;
  }
}





