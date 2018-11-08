pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    struct Star {
        string name;
        string story;
        string dec;
        string mag;
        string cent;
        string starCoordinators;
    }

    struct Response {
        string name;
        string story;
        string dec;
        string mag;
        string cent;
    }

    mapping(uint256 => Star) public tokenIdToStarInfoMap;
    mapping(uint256 => uint256) public starsForSaleMap;
    uint256[] public tokenIdIndices;

    event starCreated(address owner);

    function createStar(string _name, string _dec, string _mag, string _cent, string _story, uint256 _tokenId) public {
        //to check if star coordinators duplicate beforehand

        string memory starCoordinators = starCoordinatorsConcat(_dec, _mag, _cent);

        // can put int to a function
        for (uint i = 0; i < tokenIdIndices.length; i++) {
          uint tokenId = tokenIdIndices[i];
          Star storage star = tokenIdToStarInfoMap[tokenId];
          bool result = isStringsEqual(starCoordinators, star.starCoordinators);
          require(result != true);
        }

        //add tokenId into tokenIdIndices array
        tokenIdIndices.push(_tokenId);

        Star memory newStar = Star(_name, _story, _dec, _mag, _cent, starCoordinators);

        tokenIdToStarInfoMap[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
        emit starCreated(msg.sender);

    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(this.ownerOf(_tokenId) == msg.sender);

        starsForSaleMap[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSaleMap[_tokenId] > 0);

        uint256 starCost = starsForSaleMap[_tokenId];
        address starOwner = this.ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    function tokenIdToStarInfo(uint256 _tokenId) public view returns (string, string, string, string, string) {
      string name = tokenIdToStarInfoMap[_tokenId].name;
      string story = tokenIdToStarInfoMap[_tokenId].story;
      string dec = tokenIdToStarInfoMap[_tokenId].dec;
      string mag = tokenIdToStarInfoMap[_tokenId].mag;
      string cent = tokenIdToStarInfoMap[_tokenId].cent;

      return (name, story, dec, mag, cent);
    }

    function starsForSale(uint256 _startId) public view returns (uint256) {
      return starsForSaleMap[_startId];
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
        if (isStringsEqual(starCoordinators, tokenIdToStarInfoMap[tokenIdIndices[i]].starCoordinators)) {
          return true;
        }
      }
      return false;
    }

    function checkIfStarExist(string _dec, string _mag, string _cent) public view returns (bool) {
      string memory starCoordinators = starCoordinatorsConcat(_dec, _mag, _cent);
      for (uint i = 0; i < tokenIdIndices.length; i++) {
        if (isStringsEqual(starCoordinators, tokenIdToStarInfoMap[tokenIdIndices[i]].starCoordinators)) {
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
