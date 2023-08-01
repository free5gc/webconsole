export { fakeBackend };

function fakeBackend() {
  let users = [{ id: 1, username: 'admin', password: 'free5gc', firstName: 'Test', lastName: 'User' }];

  let realFetch = window.fetch;
  window.fetch = function (url, opts) {
    return new Promise((resolve, reject) => {
      // wrap in timeout to simulate server api call
      //setTimeout(replaceWithFakeCalls, 200);
      replaceWithFakeCalls();

      function replaceWithFakeCalls() {
        switch (true) {
          case url.endsWith('/login') && opts.method === 'POST':
            return authenticate();
          default:
            // pass through any requests not handled above
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
