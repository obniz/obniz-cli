$(() => {
  const latestVersion = "1.0.0";
  const currentVersion = window.electron.systemVersion();
  const html = `
              <ul>
                <li>Version:</li>
                <li>
                  <ul>
                    <li>Current: Ver. <%= currentVersion %></li>
                    <li>Latest: Ver. <%= latestVersion %></li>
                  </ul>
                </li>
              </ul>
    `;

  $('#versioninfo').html(ejs.render(html, {currentVersion, latestVersion}));
  $('#version').html(ejs.render(`Ver. <%= latestVersion %>`, { latestVersion }));
});
