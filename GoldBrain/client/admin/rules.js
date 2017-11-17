var rules = {
    number: function (str) {
        console.log(str);
        if (str instanceof Number) return true;
        if (!isNaN(+str)) return true;
        return "輸入數字";
    },
    f_number: function (str) {
        var str2 = +str;
        return isNaN(str2) ? 0 : str2;
    }

}


export default rules;