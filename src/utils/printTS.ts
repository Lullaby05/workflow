import { getDeptsList } from '@/api/operation/operationApi';
import multilevelLinkApi from '@/api/multilevelLink';
import { cloneDeep } from 'lodash';
import { formatDate } from './utils';

//将变量绑定打印模板，执行动态渲染
export function bindVar(
  printTemplate: string,
  variable: any,
  progressData: any,
  domId: string
) {
  const varExp = /\${\w+}/gi;
  //替换基础变量
  const printDom: any = document.getElementById(domId);
  printDom.innerHTML = printTemplate.replace(varExp, (mc) => {
    if (isNode(mc)) {
      const result = progressData.find(
        (item: any) => item.nodeId === mc.substring(2, mc.length - 1).trim()
      );
      let returnVal = '';
      returnVal += `<div style="display: block;text-align: center; font-size: 20px; font-weight: bold; height: 30px;">${
        result && result.result
          ? result.result === 'agree'
            ? '通过'
            : '不通过'
          : ''
      }</div>`;
      returnVal += `<div style="display: flex; align-items: center; justify-content: flex-end;" ><span>签名：</span>${
        result && result.signature
          ? `<img style="width: 100px; height: 50px; display: inline-block;padding: 2px;object-fit: cover;" src="${result.signature}"/>`
          : '<span style="margin-left: 40px;"></span>'
      }`;
      returnVal += `<span>${
        result && result.finishTime
          ? formatDate(result.finishTime, 'yyyy年MM月DD日HH时mm分')
          : '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日&nbsp;&nbsp;&nbsp;&nbsp;时&nbsp;&nbsp;&nbsp;&nbsp;分'
      }</span></div>`;

      return `<div>${returnVal}</div>`;
    }
    return `<span style="font-weight: 500;">${
      variable[mc.substring(2, mc.length - 1).trim()] || mc
    }</span>`;
  });
  const pDoms: any[] = printDom.getElementsByTagName('p');
  var pList = Array.prototype.slice.call(pDoms);
  pList.forEach((p: any) => {
    console.log("p标签：",p.className);
    if(p.className === 'title' || p.className === 'certNum'){
      p.style.display = 'none'
    }
  });
  
  const tableDoms: any[] = printDom.getElementsByTagName('table');
  tableDoms[0].style.fontWeight = 'bold';
  tableDoms[0].style.width = '100%';
  tableDoms[0].style.height = '100%';
  tableDoms[0].style.borderWidth = '1px';
  
  //根据字段搜索所有表格，动态渲染表格
  for (let td of tableDoms) {
    td.style.overflowWrap = 'anywhere'; // 防止输入的内容过多撑开表格
    //判断该表格存在于数据内
    console.log("表格：",td.className);
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

      if(tbody.className === 'safeMeasure'){
        let trDoms = Array.prototype.slice.call(tbody.children)
        trDoms.forEach(e=>{
          e.addAttribute('style','height: 70px')
          // e.style.height = '70px'
          Array.prototype.slice.call(e.children).forEach(td=>{
            td.style.width = '25%'
            console.log('width',td.style.width)
            if(td.style.width == 'calc(100% - 275px)'){
              console.log('width2')
              td.style.width = '65%'
            }
          })
        })
        
      }
    }
  }
  let trDoms = tableDoms[0].children[1].children
  console.log('trDoms',trDoms)
  let tr = Array.prototype.slice.call(trDoms)
  tr.forEach(e=>{
    if(e.className === 'analyze'){
      e.innerHTML=""
      e.style.height='0px'
    }
    if(e.className === 'safeMeasure'){
      let trDoms = Array.prototype.slice.call(e.children[0].children[0].children[0].children)
      trDoms.forEach(e=>{
        // e.style.height = '70px'
        Array.prototype.slice.call(e.children).forEach(td=>{
          console.log('width',td.style.width)
          if(td.style.width == 'calc(100% - 275px)'){
            console.log('width2')
            td.style.width = '70%'
          }
        })
      })
      console.log('safeMeasure',trDoms)
    }
    if(e.className === 'progress'){
      e.innerHTML=""
      e.style.height='0px'
    }
  })
  // const trDoms =  tableDoms[0].children[0].children[0].outerHTML
  printDom.innerHTML = printDom.innerHTML.replace(varExp, (mc) => {
    //没有值的字段用空代替，这里可以自己选择
    return '';
  });
  // 特殊处理
  return printDom?.innerHTML || printTemplate;
}

function isNode(data: any) {
  return data.includes('node_') || data === 'root';
}

export async function getVal(formData: any, forms: any, val: any) {
  for (let i = 0; i < forms.length; i++) {
    await decodeFieldVal(formData, forms[i], val);
  }
  // forms.forEach((item: any) => {
  //   //表单值，表单配置，要解析成的值
  //   decodeFieldVal(formData, item, val);
  // });
}

async function decodeFieldVal(formData: any, item: any, val: any) {
  let value: any = '';
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
      if (formData[item.id].otherSafetyMeasure.length) {
        formData[item.id].otherSafetyMeasure.forEach((row, i) => {
          value.push({
            number: formData[item.id].tableData.length + i + 1,
            securityMeasure: `<div style="text-align:left;">其他安全措施：</div><div>${row.otherMeasure}</div><div style="text-align: right;">编制人：${row.organizer}</div>`,
            isRelated: '是',
            confirmPerson: row.confirmPerson,
          });
        });
      }
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
    case 'DateTime': {
      const dataFormatObj: any = {
        'YYYY-MM-DD': 'yyyy年MM月DD日',
        'YYYY-MM-DD HH:mm': 'yyyy年MM月DD日HH时mm分',
      };
      value = formData[item.id]
        ? formatDate(formData[item.id], dataFormatObj[item.props.format])
        : '&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日&nbsp;&nbsp;&nbsp;&nbsp;时&nbsp;&nbsp;&nbsp;&nbsp;分';
      break;
    }
    case 'SelectInput': {
      let tempVal: string = '';
      if (item.props.isNeedApi) {
        const result = item.props.options.find(
          (v: any) => v.value === formData[item.id]
        );
        tempVal = result ? result.label : formData[item.id];
      } else {
        tempVal = formData[item.id];
      }
      value = tempVal;
      break;
    }
    case 'MultipleSelect': {
      let tempVal: string = '';
      if (item.props.isNeedApi) {
        for (let i = 0; i < formData[item.id].length; i++) {
          item.props.options.forEach((v: any) => {
            if (v.value === formData[item.id][i]) {
              tempVal += v.label + ',';
            }
          });
        }
        tempVal = tempVal.substring(0, tempVal.length - 1);
      } else {
        tempVal = String(formData[item.id]);
      }
      value = tempVal;
      break;
    }
    case 'MultilevelLink': {
      let tempVal: any[] = cloneDeep(formData[item.id]);
      const currentOptions: any = item.props.currentOptions;
      const dataMap: any[] = new Array(currentOptions.columns).fill(new Map());
      const hasData =
        formData[item.id] &&
        formData[item.id].some((ele: any) => ele[currentOptions.fields[0]]);
      if (!hasData) {
        return;
      }
      await getMultilevelLinkMap(currentOptions, dataMap, formData, item);
      for (let i = 0; i < formData[item.id].length; i++) {
        for (let j = 0; j < currentOptions.columns; j++) {
          if (j === 0) {
            const result = dataMap[0].find(
              (ele: any) =>
                ele.value === formData[item.id][i][currentOptions.fields[j]]
            );
            tempVal[i][currentOptions.fields[j]] = result
              ? result.key
              : formData[item.id][i][currentOptions.fields[j]];
          } else {
            const currentMap = dataMap[j].get(
              formData[item.id][i][currentOptions.fields[j - 1]]
            );
            const result = currentMap.find(
              (ele: any) =>
                ele.value === formData[item.id][i][currentOptions.fields[j]]
            );
            tempVal[i][currentOptions.fields[j]] = result
              ? result.key
              : formData[item.id][i][currentOptions.fields[j]];
          }
        }
      }
      value = tempVal;
      break;
    }
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
  if (item.props.valueKey === 'applyDeptId') {
    const { data: deptList } = await getDeptsList();
    const result = deptList.find((v: any) => v.id == formData[item.id]);
    value = result ? result.name : formData[item.id];
  }
  val[item.id] = value;
}

const getMultilevelLinkMap = async (
  currentOptions: any,
  dataMap: any[],
  formData: any,
  item: any
) => {
  // 获取所有的下拉数据，第一项为数组，后面的则为map
  for (let i = 0; i < currentOptions.columns; i++) {
    if (i === 0) {
      dataMap[i] = currentOptions.options[i];
    } else {
      for (let index = 0; index < formData[item.id].length; index++) {
        if (
          !dataMap[i].has(
            formData[item.id][index][currentOptions.fields[i - 1]]
          )
        ) {
          const { data } = await multilevelLinkApi.getMultilevelLink(
            currentOptions.apis[i],
            formData[item.id][index][currentOptions.fields[i - 1]]
          );
          formatDataMap(data, currentOptions, i);
          dataMap[i].set(
            formData[item.id][index][currentOptions.fields[i - 1]],
            currentOptions.options[i]
          );
        }
      }
    }
  }
};

const formatDataMap = (dataArr: any, currentOptions: any, index: number) => {
  // 后台返回值可能是Map，需要转换成数组
  if (Object.prototype.toString.call(dataArr) === '[object Object]') {
    currentOptions.options[index] = Object.keys(dataArr).map((key) => ({
      key,
      value: dataArr[key],
    }));
  } else {
    currentOptions.options[index] = dataArr.map((ele: any) => ({
      key: ele.name,
      value: ele.id,
    }));
  }
};

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
