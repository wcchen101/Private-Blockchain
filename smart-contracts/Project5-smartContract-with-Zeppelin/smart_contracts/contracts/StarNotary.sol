pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    struct Star {
        string name;
        string starCoordinators;
        string story;
    }

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;
    uint256[] public tokenIdIndices;

    function createStar(string _name, string _dec, string _mag, string _cent, string _story, uint256 _tokenId) public {
        //to check if star coordinators duplicate beforehand
        string memory starCoordinators = starCoordinatorsConcat(_dec, _mag, _cent);

        // can put int to a function
        for (uint i = 0; i < tokenIdIndices.length; i++) {
          uint tokenId = tokenIdIndices[i];
          Star storage star = tokenIdToStarInfo[tokenId];
          bool result = isStringsEqual(starCoordinators, star.starCoordinators);
          require(result != true);
        }

        //add tokenId into tokenIdIndices array
        tokenIdIndices.push(_tokenId);

        Star memory newStar = Star(_name, starCoordinators, _story);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function starCoordinatorsConcat(string _dec, string _mag, string _cent) public returns (string) {
      bytes memory _decBytes = bytes(_dec);
      bytes memory _magBytes = bytes(_mag);
      bytes memory _centBytes = bytes(_cent);
      string memory starCoordinatorsStr = new string(_decBytes.length + _magBytes.length + _centBytes.length);
      bytes memory starCoordinatorsBytes = bytes(starCoordinatorsStr);
      uint j = 0;
      for (uint i = 0; i < _decBytes.length; i++) starCoordinatorsBytes[j++]  = _decBytes[i];
      for (i = 0; i < _magBytes.length; i++) starCoordinatorsBytes[j++] = _magBytes[i];
      for (i = 0; i < _centBytes.length; i++) starCoordinatorsBytes[j++] = _centBytes[i];
      return string(starCoordinatorsStr);
    }

    function checkStarExist(string _dec, string _mag, string _cent) internal returns (bool) {
      string memory starCoordinators = starCoordinatorsConcat(_dec, _mag, _cent);
      for (uint i = 0; i < tokenIdIndices.length; i++) {
        if (isStringsEqual(starCoordinators, tokenIdToStarInfo[tokenIdIndices[i]].starCoordinators)) {
          return true;
        }
      }
      return false;
    }

    function checkIfStarExist(string _dec, string _mag, string _cent) public view returns (bool) {
      string memory starCoordinators = starCoordinatorsConcat(_dec, _mag, _cent);
      for (uint i = 0; i < tokenIdIndices.length; i++) {
        if (isStringsEqual(starCoordinators, tokenIdToStarInfo[tokenIdIndices[i]].starCoordinators)) {
          return true;
        }
      }
      return false;
    }

    function isStringsEqual(string _strA, string _strB) internal returns (bool) {
      bytes memory strA = bytes(_strA);
      bytes memory strB = bytes(_strB);
      if (strA.length != strB.length) {
        return false;
      }

      for (uint i = 0; i < strA.length; i++) {
        if(strA[i] != strB[i]) {
          return false;
        }
      }
      return true;
    }

    function mint(uint256 _tokenId) public {
      _mint(msg.sender, _tokenId);
    }
}
