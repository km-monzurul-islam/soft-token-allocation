class TokenInfo {
    #date;
    constructor(serialNumber, scotiaID, fullName, status, modifiedDate) {
        this.serialNumber = serialNumber;
        this.scotiaID = scotiaID;
        this.fullName = fullName;
        this.status = status;
        this.modifiedDate = modifiedDate;
    };
    set modifiedDate(date){
        this.#date = new Date(date);
    };

    get modifiedDate(){
        return this.#date;
    };

    calcDays(){
        const now = new Date();
        const dif = Math.abs(now - this.modifiedDate);
        return Math.floor(dif/(1000 * 3600 * 24));
    };
}

class OtrcInfo {
    constructor(scotiaID, otrc, generatedTime, serialNumber) {
        this.scotiaID = scotiaID;
        this.otrc = otrc;
        this.generatedTime = generatedTime;
        this.serialNumber = serialNumber;
    }
}

class UserInfo{
    constructor(reqNumber, name, scotiaID, email, managerEmail, template){
        this.reqNumber = reqNumber;
        this.name = name;
        this.scotiaID = scotiaID;
        this.email = email;
        this.managerEmail = managerEmail;
        this.template = template;
        this.otrc = null;
        this.otrcCreatedAt = null;
    }
}

module.exports = {
    TokenInfo,
    OtrcInfo,
    UserInfo,
}