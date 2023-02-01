//********************
//Classe para reunir as propriedades comuns do usuário do teams,
//para facilitar a organização do código e adicionar validações.
//********************

module.exports = class TeamsUser {
  constructor(userId, userName, userEmail) {
    this.userId = userId;
    this.userName = userName;
    this.userEmail = userEmail;
  };
}
