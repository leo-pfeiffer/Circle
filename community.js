exports.makeUser = (userName, userEmail) => {
    function User () {
        this.userName = userName;
        this.userEmail = userEmail;
        this.changeName = function (newName) {
            this.userName = newName;
        } 
    }
    return new User()
}