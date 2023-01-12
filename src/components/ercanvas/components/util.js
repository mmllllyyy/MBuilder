export const renderer = {
  heading(text, level, raw, slugger) {
    if (this.options.headerIds) {
      return `<h${
         level
         } style="margin: 5px" id="${
         this.options.headerPrefix
         }${slugger.slug(raw)
         }">${
         text
         }</h${
         level
         }>\n`;
    }
    // ignore IDs
    return `<h${level} style="margin: 5px">${text}</h${level}>\n`;
  },
  paragraph(text) {
    return `<p style="margin: 5px">${text}</p>`;
  },
  hr(){
    return '<hr style="margin: 0;border-style: solid;color: #F2F5F6" size="1px"/>';
  },
  list(body, ordered, start) {
    const type = ordered ? 'ol' : 'ul',
      startatt = (ordered && start !== 1) ? (` start="${start}"`) : '';
    return `<${type}${startatt} style="text-align: left;margin: 0px 0px 0px 20px;padding: 0px;line-height: 10px;${ordered ? '' : 'list-style: circle'}">\n${body}</${type}>\n`;
  },
};

// 创建右键菜单
export const createContentMenu = (event, menus, cb) => {
    let menuContainer = document.querySelector('.ercanvas-menus');
    if (menuContainer) {
        menuContainer.parentElement.removeChild(menuContainer);
    }
    menuContainer = document.createElement('div');
    menuContainer.setAttribute('class', 'ercanvas-menus');
    document.body.appendChild(menuContainer);
    menuContainer.onblur = () => {
        menuContainer.onblur = null;
        menuContainer.onclick = null;
        menuContainer.style.display = 'none';
    };
    menuContainer.onclick = () => {
        menuContainer.blur();
    };
    menuContainer.setAttribute('tabindex', '0');
    menuContainer.style.left = `${event.clientX + 1}px`;
    menuContainer.style.top = `${event.clientY + 1}px`;
    const ul = document.createElement('ul');
    menus.forEach((m, i) => {
        const li = document.createElement('li');
        li.onclick = () => {
            cb && cb(i);
        };
        li.innerText = m.name;
        ul.appendChild(li);
    });
    menuContainer.appendChild(ul);
    setTimeout(() => {
        menuContainer.focus();
    });
};
