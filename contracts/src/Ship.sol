// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import 'hardhat/console.sol';

abstract contract Ship {
  function update(uint x, uint y) public virtual;
  function fire() public virtual returns (uint, uint);
  function place(uint width, uint height) public virtual returns (uint, uint);
}

contract MyShip is Ship{

  uint private x;
  uint private y;
  uint private target_x;
  uint private target_y;

  function update(uint _x, uint _y) public override{
    x= _x;
    y = _y;
  }

  function fire() public override returns (uint t_x, uint t_y){
    t_x = target_x;
    t_y = target_y;
  }

  function place(uint width, uint height) public override returns (uint cord_x, uint cord_y){
    cord_x = x;
    cord_y = y;
  }

  function setShipPostion(uint _x, uint _y)external{
    x = _x;
    y = _y;
  }

  function setTargetPostion(uint _x, uint _y) external {
    target_x = _x;
    target_y = _y;
  }
}





