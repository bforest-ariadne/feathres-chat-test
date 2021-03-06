const socket = io();
// let document = global.document;

const client = feathers();
client.configure(feathers.socketio(socket));

client.configure(feathers.authentication({
  storage: window.localStorage
}));

let userData;

const login = async (credentials) => {
  try {
    let authResult;
    if (!credentials) {
      authResult = await client.reAuthenticate();
    } else {
      authResult = await client.authenticate({
        strategy: 'local',
        ...credentials
      });
    }
    console.log('login successful', authResult);
    userData = authResult.user;
    await client.service('users').patch(userData._id, {
      ...userData,
      online: true
    });
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
    <div class ="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
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
        <a class="button button-primary block" href="/oauth/google">
          Login with Google
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
  <div class="flex flex-column col-9 flex-center">
  <header class="flex flex-row flex-center">
      <h3 class="font-300 text-center">Controls</h3>
  </header>
  <ul class="flex flex-row flex-2 list-unstyled controls-list" style="padding: 0.5em;">
  </ul>
</div>
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
    
    <div class="flex flex-column col col-9">
    <main class="chat flex flex-column flex-1 clear"></main>

    <form class="flex flex-row flex-space-between", id="send-message">
      <input type="text" name="text" class="flex flex-1">
      <button class="button button-primary">Send</button>
    </form>
    </div>
  </div>
</main>
`;

const showChat = async () => {
  // console.log('showChat');
  document.getElementById('app').innerHTML = chatHTML;

  const messages = await client.service('messages').find({
    query: {
      $sort: { createdAt: -1 },
      $limit: 25
    }
  });
  messages.data.reverse().forEach(addMessage);

  const users = await client.service('users').find();
  // console.log('users', users.data);
  users.data.forEach(addUser);


  const controls = await client.service('controls').find();
  controls.data.reverse().forEach(addControl);
  
};

const removeMessage = (message) => {
  console.log('removeMessage');
  const { _id = '' } = message;
  const chat = document.querySelector('.chat');

  if (chat) {
    const messageElement = chat.querySelector(`#${_id}`);
    console.log('removeMessage chat', messageElement);
    if (messageElement) {
      console.log('removeChild');
      chat.removeChild(messageElement);
    }
  }
};

const addMessage = message => {
  const { user = {}, _id = '' } = message;
  const chat = document.querySelector('.chat');

  const text = message.text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (chat) {
    chat.innerHTML += /*html*/`
      <div class="message flex flex-row" id="${_id}">
        <img src="${user.avatar}" alt="${user.email}" class="avatar">
        <div class="message=wrapper">
        <p class="message-header">
          <span class="username font-600">${user.email}</span>
          <span class="sent-data font-300">${moment(message.createdAt).format('MMM Do, hh:mm:ss')}</span>
        </p>
        <p class="message-content font-300">${text}</p>
        </div>
      </div>
    `;

    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  }
};

const addControl = control => {
  const { label, state, _id = '' } = control;
  const controlsList = document.querySelector('.controls-list');
  // console.log('state', state, typeof(state));

  const controlSwitchHTML = /*html*/`
    <li id="${_id}" style="margin: 1em; padding: 1em;">
      <p>${label}</p>
        <label class="switch">
          <input type="checkbox" ${state ? 'checked': ''}>
          <span class="slider"></span>
        </label>
    </li>
  `;

  if (controlsList) {
    controlsList.innerHTML += controlSwitchHTML;
  }
};

const updateControl = control => {
  const { _id, state } = control;
  const controlParent = document.getElementById(_id);
  const controlElement = controlParent.querySelector('input');

  controlElement.checked = state;
};


const addUser = user => {
  const userList = document.querySelector('.user-list');

  if (userList) {

    const userElements = userList.getElementsByClassName(user._id);

    if (user.online && userElements.length === 0) {
      userList.innerHTML += /*html*/`
      <li class="${user._id}">
        <a class="block relative" href="#">
          <img src="${user.avatar}" class="avater">
          <span class="absolute username">${user.email}</span>
        </a>
      </li>
    `;
    } else if (!user.online && userElements.length !== 0) {
      // console.log('user._id', user._id);

      for (let i = 0; i < userElements.length; i++ ) {
        userList.removeChild( userElements[ i ] );
      }
    }
  
    const userCount = document.querySelectorAll('.user-list li').length;

    document.querySelector('.online-count').innerHTML = userCount;
  }
};

const showLogin = (error) => {
  console.log('showLogin');
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

addEventListener('[type="checkbox"]', 'click', async ev => {
  // await.client.service('controls').patch()
  const checkbox = ev.target.closest('[type="checkbox"]');
  // console.log('checkbox clicked', checkbox);
  const state = checkbox.checked;
  const id = checkbox.closest('li').id;

  await client.service('controls').patch(id, {
    state: state
  });
});

addEventListener('#signup', 'click', async () => {
  const credentials = getCredentials();
  await client.service('users').create(credentials);

  await login(credentials);

});

addEventListener('#logout', 'click', async () => {


  await client.service('users').patch(userData._id, {
    ...userData,
    online: false
  });

  await client.logout();
  userData = null;

  document.getElementById('app').innerHTML = loginHTML;
});

addEventListener('#login', 'click', async () => {
  const user = getCredentials();
  await login(user);
});

addEventListener('#send-message', 'submit', async ev => {
  const input = document.querySelector('[name="text"]');
  
  ev.preventDefault();

  await client.service('messages').create({
    text: input.value
  });

  input.value = '';
});



client.service('messages').on('created', addMessage);
client.service('messages').on('removed', removeMessage);

client.service('users').on('created', addUser);
client.service('users').on('patched', addUser);
client.service('controls').on('patched', updateControl);



