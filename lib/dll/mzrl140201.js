var mzrl140201 = function(){
  this.itemtype = 'actor';
  this.manufacturer = 'mozkito electronics';
  this.description = 'a simple relay';
  this.status = 0;
  this.listen = true;
  this.err = '';
  that = this;
  this.verify = function (value){
    value = value.toString();
    if(!value || value == this.status) {
      that.err = 'value not set or no status change';
      return false;
    }

    if('1' == value || '0' == value || '2' == value){
      return true;
    }

    that.err = 'value not expected';
    return false;
  };
};

module.exports = mzrl140201;
