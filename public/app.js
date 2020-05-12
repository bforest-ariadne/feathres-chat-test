const socket = io();

const client = feathers();
client.configure(feathers.socketio(socket));

client.configure(feathers.authentication({
  storage: window.localStorage
}));

const login = async (credentials) => {
  try {
    if (!credentials) {
      await client.reAuthenticate();
    } else {
      await client.authenticate({
        strategy: 'local',
        ...credentials
      });
    }
    // show chat messages
    showChat();
  } catch (error) {
    showLogin(error);
  }
};

const main = async () => {
  const auth = await login();

  console.log('User is authenticated', auth);
};

console.log('app.js');
main();

const loginHTML = /*html*/`

<main class="login container">
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet text-center heading">
      <h1 class="font-100">Login or signup</h1>
    </div>
  </div>
  <div class="row">
    <div class = col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
      <form class="form">
        <fieldset>
          <input class="block" type="email" name="email" placeholder="email">
        </fieldset>
        <fieldset>
          <input class="block" type="password" name="password" placeholder="password">
        </fieldset>
        <button type="button" id="login" class="button button-primary block signup">
          Log in
        </button>
        <button type="button" id="signup" class="button button-primary block signup">
          Sign up and login
        </button>
        <a class="button button-primary block" href="/oauth/github">
          Login with Github
        </a>
      </form>
    </div>
  </div>
</main>
`;

const chatHTML = /*html*/`
<main class="flex flex-column">
  <header class="title-bar flex flex-row flex-center">
    <div class="title-wrapper block center-element">
      <img class="logo" src="http://feathersjs.com/img/feathers-logo-wide.png" alt="Feathers Logo">
      <span class="title">Chat</span>
    </div>
  </header>
  <div class="flex flex-row flex-1 clear">
    <aside class="sidebar col col-3 flex flex-column flex-space-between">
      <header class="flex flex-row flex-center">
        <h4 class="font-300 text-center">
        <span class="font-600 online-count">0</span> users
        </h4>
      </header>
      <ul class="flex flex-column flex-1 list-unstyled user-list"></ul>
      <footer class="flex flex-row flex_center">
        <a href="#" id="logout" class="button button-primary">
        Sign Out
        </a>
      </footer>
    </aside>
  </div>
</main>
`;

const showChat = () => {
  document.getElementById('app').innerHTML = chatHTML;
};

const showLogin = (error) => {
  if (document.querySelectorAll('.login').length && error) {
    document.querySelector('.heading').insertAdjacentHTML('beforeend', `<p>There was an error: ${error.message}</p>`);
  } else {
    document.getElementById('app').innerHTML = loginHTML;
  }
};

showLogin();

const getCredentials = () => {
  const user = {
    email: document.querySelector('[name="email"]').value,
    password: document.querySelector('[name="password"]').value
  };
  return user;
};

const addEventListener = (selector, event, handler) => {
  document.addEventListener(event, async ev => {
    if (ev.target.closest(selector)) {
      handler(ev);
    }
  });
};

addEventListener('#signup', 'click', async () => {
  const credentials = getCredentials();
  await client.service('users').create(credentials);

  await login(credentials);

});