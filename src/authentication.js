const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth, OAuthStrategy } = require('@feathersjs/authentication-oauth');

class GithubStrategy extends OAuthStrategy {
  async getEntityData(profile) {
    const baseData = await super.getEntityData(profile);
    let userEmail = profile.email || `${[profile.login]}@github.com`;

    return {
      ...baseData,
      email: userEmail,
      githubAvatar: profile.avatar
    };
  }
}

class GoogleStrategy extends OAuthStrategy {
  async getEntityData(profile) {
    const baseData = await super.getEntityData(profile);
    let userEmail = profile.email;
    console.log('google email', profile.email);

    return {
      ...baseData,
      email: userEmail,
      picture: profile.picture,
      hd: profile.hd
    };
  }
}

module.exports = app => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());
  authentication.register('github', new GithubStrategy());  
  authentication.register('google', new GoogleStrategy());  


  app.use('/authentication', authentication);
  app.configure(expressOauth());
};
