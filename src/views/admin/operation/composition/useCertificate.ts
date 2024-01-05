export const useCertificate = () => {
  // 通过processFormKey去匹配对应的formItem,并且格式化design
  const searchFormItem = (processData: any, processKey: string): any => {
    const currentData = processData.progress.find(
      (ele: any) => ele.processKey === processKey
    );
    if (!currentData || !currentData.processFormKey) return;
    const formKey: string = currentData.processFormKey;
    const formItems = processData.formItems.find(
      (ele: any) => ele.name === 'ModuleBlock' && ele.id === formKey
    );
    // const formItemIds = generateFormItemIds(formItems.props.items);
    // const paramsFormData: any = {};
    // formItemIds.forEach((item: string) => {
    //   paramsFormData[item] = processData.formData[item];
    // });
    return {
      ...processData,
      formData: processData.formData,
      formItems: formItems.props.items,
      formConfig: processData.formConfig,
    };
  };

  const searchFormItemForAdd = (processData: any, processKey: string): any => {
    const currentData = processData.progress.find(
      (ele: any) => ele.props.processKey === processKey
    );
    if (!currentData || !currentData.props.processFormKey) return;
    const formKey: string = currentData.props.processFormKey;
    const formItems = processData.formItems.find(
      (ele: any) => ele.name === 'ModuleBlock' && ele.id === formKey
    );
    const formItemIds = generateFormItemIds(formItems.props.items);
    const paramsFormData: any = {};
    if (processData.formData) {
      formItemIds.forEach((item: string) => {
        paramsFormData[item] = processData.formData[item];
      });
    }
    return {
      ...processData,
      formData: paramsFormData,
      formItems: formItems.props.items,
      formConfig: processData.formConfig,
    };
  };

  const formItemIds: any[] = [];
  // 收集树形表格里的id
  const generateFormItemIds = (formItems: any) => {
    for (const item of formItems) {
      if (item.name === 'ModuleBlock' || item.name === 'SpanLayout') {
        if (item.props.items.length) {
          generateFormItemIds(item.props.items);
        }
      } else {
        formItemIds.push(item.id);
      }
    }
    return formItemIds;
  };

  // 处理progress，将树形对象数据扁平化
  const flatArr: any[] = [];
  const flatObject = (progress: any) => {
    flatArr.push(progress);
    if (progress.children && progress.children.id) {
      flatObject(progress.children);
    }
    delete progress.children;
    return flatArr;
  };

  // 通过valueKey查找所有的对应的itemId，最后会获取一个map用于对应valueKey和真实表单字段
  const valueKeyMap: any = {};
  const generateValueKeyMap = (formItems: any) => {
    formItems.forEach((item: any) => {
      if (item.props.valueKey) {
        valueKeyMap[item.props.valueKey] = item.id;
      }
      if (item.props.items) {
        generateValueKeyMap(item.props.items);
      }
    });
    return valueKeyMap;
  };

  return {
    searchFormItemForAdd,
    searchFormItem,
    flatObject,
    generateValueKeyMap,
  };
};
