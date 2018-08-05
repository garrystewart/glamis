function userAlert(msg, warn) {
    if (warn){
      console.warn(msg);
    } else {
      console.log(msg);
    }
    alert(msg);
  }