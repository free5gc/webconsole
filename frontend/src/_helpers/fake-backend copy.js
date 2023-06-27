export { fakeBackend };

function fakeBackend() {
  let state = 0;  // this is used to simulate different answers from the backend

  let users = [{ id: 1, username: 'admin', password: 'free5gc', firstName: 'Test', lastName: 'User' }];

  let nodes = [
    {
      id: 'amf', instance: 1, address: '127.0.0.1:8000', status: 'online', connections: [
        { id: 'sba' },
        { id: 'ran' }
      ]
    },
    {
      id: 'smf', instance: 1, address: '127.0.0.1:8001', status: 'online', connections: [
        { id: 'sba' },
        { id: 'upf' },
      ]
    },
    {
      id: 'upf-1', instance: 1, address: '127.0.0.1:8002', status: 'online', connections: []
    },
    {
      id: 'upf-2', instance: 2, address: '127.0.0.1:8003', status: 'offline', connections: []
    },

    { id: 'ausf', address: '127.0.0.1:8004', status: 'online' },
    { id: 'n3iwf', address: '127.0.0.1:8005', status: 'online' },
    { id: 'nrf', address: '127.0.0.1:8006', status: 'online' },
    { id: 'nssf', address: '127.0.0.1:8007', status: 'online' },
    { id: 'pcf', address: '127.0.0.1:8008', status: 'online' },
    { id: 'udm', address: '127.0.0.1:8009', status: 'online' },
    { id: 'udr', address: '127.0.0.1:8010', status: 'online' },

    { id: 'mongodb', address: '127.0.0.1:27017', status: 'online' },
    { id: 'ran', address: '127.0.0.1:9999', status: 'online' },
    { id: 'ue', address: '127.0.0.1:1010', status: 'online' },
    { id: 'dn', address: '', status: '' }
  ]

  let realFetch = window.fetch;
  window.fetch = function (url, opts) {
    return new Promise((resolve, reject) => {
      // wrap in timeout to simulate server api call
      //setTimeout(handleRoute, 200);
      handleRoute();

      function handleRoute() {
        switch (true) {
          case url.endsWith('/login') && opts.method === 'POST':
            return authenticate();
          //case url.endsWith('/topology') && opts.method === 'GET':
          //  return topology();
          default:
            // pass through any requests not handled above
            //console.log(`doing real fetch to ${url}`);
            //console.log(opts);
            return realFetch(url, opts)
              .then(response => resolve(response))
              .catch(error => reject(error));
        }
      }

      // route functions

      function authenticate() {
        const { username, password } = body();
        const user = users.find(x => x.username === username && x.password === password);

        if (!user) return error('Username or password is incorrect');

        return ok({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          token: 'admin'
        });
      }

      // this can be used to simulate the answer for getting the core topology
      function topology() {
        console.log('returning fake topology ', state);
        if (state === 3) {
          /*nodes.push({
            id: 'upf-3', address: '127.0.0.1:8004', status: 'offline', connections: [
              { id: 'smf' },
              { id: 'upf-1' },
              { id: 'upf-2' }
            ]
          },);*/
          nodes.map(node => {
            return node.status = 'offline'
          });
          state = 0;
        } else {
          //nodes.splice(-1);
          nodes.map(node => {
            return node.status = 'online'
          });
          state++;
        }
        return ok(nodes);
      }

      // helper functions

      function ok(body) {
        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(body)) })
      }

      function error(message) {
        resolve({ status: 400, text: () => Promise.resolve(JSON.stringify({ message })) })
      }

      function body() {
        return opts.body && JSON.parse(opts.body);
      }
    });
  }
}
