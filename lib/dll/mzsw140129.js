var mzsw140129 = function(){
  this.itemtype = 'sensor';
  this.manufacturer = 'mozkito industries';
  this.description = 'a simple push button';
  this.verify = function (value){
    if(!value) {
      return false;
    }

    if('1' == value || '0' == value){
      return true;
    }

    return false;
  }
};

module.exports = mzsw140129;
