/* global $ */

$(() => {
  if ($('.user-menu.disabled').length === 0) {
    const userinfo = window.electron.userinfo();
    if (userinfo) {
      const html = `
              <ul>
                <% if(name){%>
                <li>User:</li>
                <li>
                  <ul>
                    <li><%= name %></li>
                    <li><%= email %></li>
                  </ul>
                </li>
                <% } else { %>
                <li>Token login</li>
                <% }  %>
              </ul>
        `;

      $('#userinfo').html(
        ejs.render(html, { name: userinfo.name, email: userinfo.email })
      );
    }
  }
});
