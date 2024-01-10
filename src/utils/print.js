//将变量绑定打印模板，执行动态渲染
export function bindVar(printTemplate, variable, domId) {
  const varExp = /\${\w+}/gi;
  //替换基础变量
  const printDom = document.getElementById(domId);
  console.log("printDom",printDom);
  printDom.innerHTML = printTemplate.replace(varExp, (mc) => {
    return variable[mc.substring(2, mc.length - 1).trim()] || mc;
  });
  const tableDoms = printDom.getElementsByTagName('table');
  //根据字段搜索所有表格，动态渲染表格
  for (let td of tableDoms) {
    //判断该表格存在于数据内
    if (Array.isArray(variable[td.className])) {
      const tbody = td.children[0];
      let tr = '';
      if (tbody.children.length === 1) {
        //可能是没有表头，就直接扫首行
        tr = tbody.children[0].outerHTML;
      } else {
        //按最后一行来处理
        tr = tbody.children[tbody.children.length - 1].outerHTML;
      }
      //判断有没有变量存在，没有就不处理
      if (varExp.test(tr)) {
        //行循环
        let tbHtml = '',
          thHtml = '';
        (variable[td.className] || []).forEach((row) => {
          tbHtml += tr.replace(varExp, (mc) => {
            return row[mc.substring(2, mc.length - 1).trim()] || mc;
          });
        });
        //取表头部分
        for (let i = 0; i < tbody.children.length - 1; i++) {
          thHtml += tbody.children[i].outerHTML;
        }
        tbody.outerHTML = thHtml + tbHtml;
      }
    }
  }
  printDom.innerHTML = printDom.innerHTML.replace(varExp, (mc) => {
    //没有值的字段用空代替，这里可以自己选择
    return '';
  });
}

export function getVal(formData, forms, val) {
  forms.forEach((item) => {
    //表单值，表单配置，要解析成的值
    decodeFieldVal(formData, item, val);
  });
}

function decodeFieldVal(formData, item, val) {
  let value = '';
  switch (item.name) {
    case 'ModuleBlock':
    case 'SpanLayout':
      getVal(formData, item.props.items, val);
      break;
    case 'TableList':
      value = [];
      (formData[item.id] || []).forEach((row, i) => {
        value.push({});
        item.props.columns.forEach((col) => {
          decodeFieldVal(row, col, value[i]);
        });
      });
      break;
    case 'SafetyMeasure':
      value = [];
      (formData[item.id].tableData || []).forEach((row, i) => {
        value.push({
          number: row.number,
          securityMeasure: row.securityMeasure,
          isRelated: row.isRelated,
          confirmPerson: row.confirmPerson,
        });
      });
      break;
    case 'TimeRangePicker':
    case 'DateTimeRange':
      const v = formData[item.id];
      if (Array.isArray(v) && v.length > 1) {
        value = v[0] + ' ~ ' + v[1];
      }
      break;
    case 'DeptPicker':
    case 'UserPicker':
      value = String((formData[item.id] || []).map((v) => v.name));
      break;
    case 'MultipleSelect':
      value = String(formData[item.id]);
      break;
    case 'SignPanel':
      if (formData[item.id]) {
        value = `<img style="width: 150px; height: 100px; padding: 2px;" src="${
          formData[item.id]
        }"/>`;
      }
      break;
    case 'ImageUpload':
      formData[item.id].forEach((it) => {
        value += `<img style="width: 150px; height: 100px; padding: 2px;" src="${window.$vueApp.config.globalProperties.$getRes(
          it.url
        )}"/>`;
      });
      break;
    case 'FileUpload':
      value = String((formData[item.id] || []).map((v) => v.name));
      break;
    default:
      value = formData[item.id];
      break;
  }
  val[item.id] = value;
}

/* eslint-disable */
const Print = function (dom, options) {
  if (!(this instanceof Print)) return new Print(dom, options);

  this.options = this.extend(
    {
      noPrint: '.no-print',
    },
    options
  );

  if (typeof dom === 'string') {
    this.dom = document.querySelector(dom);
  } else {
    this.isDOM(dom);
    this.dom = this.isDOM(dom) ? dom : dom.$el;
  }

  this.init();
};
Print.prototype = {
  init: function () {
    var content = this.getStyle() + this.getHtml();
    this.writeIframe(content);
  },
  extend: function (obj, obj2) {
    for (var k in obj2) {
      obj[k] = obj2[k];
    }
    return obj;
  },

  getStyle: function () {
    var str = '',
      styles = document.querySelectorAll('style,link');
    for (var i = 0; i < styles.length; i++) {
      str += styles[i].outerHTML;
    }
    str +=
      '<style>' +
      (this.options.noPrint ? this.options.noPrint : '.no-print') +
      '{display:none;}</style>';

    return str;
  },

  getHtml: function () {
    var inputs = document.querySelectorAll('input');
    var textareas = document.querySelectorAll('textarea');
    var selects = document.querySelectorAll('select');
    var canvass = document.querySelectorAll('canvas');
    for (var k = 0; k < inputs.length; k++) {
      if (inputs[k].type == 'checkbox' || inputs[k].type == 'radio') {
        if (inputs[k].checked == true) {
          inputs[k].setAttribute('checked', 'checked');
        } else {
          inputs[k].removeAttribute('checked');
        }
      } else if (inputs[k].type == 'text') {
        inputs[k].setAttribute('value', inputs[k].value);
      } else {
        inputs[k].setAttribute('value', inputs[k].value);
      }
    }

    for (var k2 = 0; k2 < textareas.length; k2++) {
      if (textareas[k2].type == 'textarea') {
        textareas[k2].innerHTML = textareas[k2].value;
      }
    }

    for (var k3 = 0; k3 < selects.length; k3++) {
      if (selects[k3].type == 'select-one') {
        var child = selects[k3].children;
        for (var i in child) {
          if (child[i].tagName == 'OPTION') {
            if (child[i].selected == true) {
              child[i].setAttribute('selected', 'selected');
            } else {
              child[i].removeAttribute('selected');
            }
          }
        }
      }
    }
    //打印canvas图像
    for (var k4 = 0; k4 < canvass.length; k4++) {
      var imageURL = canvass[k4].toDataURL('image/png');
      var img = document.createElement('img');
      img.src = imageURL;
      img.setAttribute('style', canvass[k4].getAttribute('style'));
      img.setAttribute('class', canvass[k4].getAttribute('class'));
      canvass[k4].style.display = 'none';
      canvass[k4].parentNode.insertBefore(img, canvass[k4].nextElementSibling);
    }
    // 包裹要打印的元素
    let outerHTML = this.dom.parentElement.innerHTML;
    //this.wrapperRefDom(this.dom).outerHTML
    return outerHTML;
  },
  // 向父级元素循环，包裹当前需要打印的元素
  // 防止根级别开头的 css 选择器不生效
  wrapperRefDom: function (refDom) {
    let prevDom = null;
    let currDom = refDom;
    // 判断当前元素是否在 body 中，不在文档中则直接返回该节点
    if (!this.isInBody(currDom)) return currDom;

    while (currDom) {
      if (prevDom) {
        let element = currDom.cloneNode(false);
        element.appendChild(prevDom);
        prevDom = element;
      } else {
        prevDom = currDom.cloneNode(true);
      }

      currDom = currDom.parentElement;
    }

    return prevDom;
  },

  writeIframe: function (content) {
    var w,
      doc,
      iframe = document.createElement('iframe'),
      f = document.body.appendChild(iframe);
    iframe.id = 'myIframe';
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    w = f.contentWindow || f.contentDocument;
    doc = f.contentDocument || f.contentWindow.document;
    doc.open();
    doc.write(content);
    doc.close();
    var _this = this;
    iframe.onload = function () {
      _this.toPrint(w);
      setTimeout(function () {
        document.body.removeChild(iframe);
      }, 100);
    };
  },

  toPrint: function (frameWindow) {
    try {
      setTimeout(function () {
        frameWindow.focus();
        try {
          if (!frameWindow.document.execCommand('print', false, null)) {
            frameWindow.print();
          }
        } catch (e) {
          frameWindow.print();
        }
        frameWindow.close();
      }, 10);
    } catch (err) {
      console.log('err', err);
    }
  },
  // 检查一个元素是否是 body 元素的后代元素且非 body 元素本身
  isInBody: function (node) {
    return node === document.body ? false : document.body.contains(node);
  },
  isDOM:
    typeof HTMLElement === 'object'
      ? function (obj) {
          return obj instanceof HTMLElement;
        }
      : function (obj) {
          return (
            obj &&
            typeof obj === 'object' &&
            obj.nodeType === 1 &&
            typeof obj.nodeName === 'string'
          );
        },
};
export default Print;
