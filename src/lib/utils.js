// 不依赖其他文件[react相关/样式相关] 方便后续使用worker线程 此处方法皆为影子方法 所有方法都使用_开头
// 此文件中禁止引入dom/css/localStorage相关
import demoProject from './template/教学管理系统.pdma.json';
import allLangData from '../lang';
import _ from 'lodash';
import doT from 'dot';
import {separator} from '../../profile';
import {firstUp} from './string';
import './Math';

export const _getDefaultTemplate = (db, template, dataSource, lang = 'zh') => {
    const dataType = dataSource.profile?.dataTypeSupports?.filter(d => d.id === db)[0];
    if (dataType) {
        const emptyDataType = demoProject.profile.dataTypeSupports.filter(d => d.defKey?.toLocaleLowerCase()
            === dataType.defKey?.toLocaleLowerCase())[0];
        const emptyTemplate = demoProject.profile.codeTemplates.filter(c => c.applyFor === emptyDataType?.id)[0];
        return emptyTemplate?.[template] || `# ${allLangData[lang].emptyDefaultTemplate}`;
    }
    return `# ${allLangData[lang].emptyDefaultTemplate}`;
};

export const _transform = (f, dataSource, code, type = 'id', codeType = 'dbDDL', omitName = []) => {
    // 获取该数据表需要显示的字段
    const domains = dataSource?.domains || [];
    const entities = dataSource?.entities || [];
    const mappings = dataSource?.dataTypeMapping?.mappings || [];
    const db = _.get(dataSource, 'profile.default.db', _.get(dataSource, 'profile.dataTypeSupports[0].id'));
    const dicts = dataSource?.dicts || [];
    const uiHints = _.get(dataSource, 'profile.uiHint', []);
    const temp = {};
    if (codeType === 'dbDDL'){
        // 转换数据域
        if (f.domain) {
            const domainIndex = domains.findIndex(dom => dom[type] === f.domain);
            const domain = domains[domainIndex] || { len: '', scale: '' };
            const dataType = mappings.filter(m => m.id === domain.applyFor)[0]?.[code || db] || '';
            temp.len = domain.len === undefined ? '' : domain.len;
            temp.scale = domain.scale === undefined ? '' : domain.scale;
            temp.type = dataType;
            temp.domain = type === 'id' ? (domain.defName || domain.defKey) : f.domain;
            temp.dbType = mappings.filter(m => m.id === domain.applyFor)[0]?.[db] || f.type;
            temp.domainData = domain;
        } else {
            const realType = mappings.filter(m => m[db] === f.type)[0]?.[code] || f.type;
            temp.type = realType;
            temp.dbType = realType;
        }
    } else {
        // 代码类型转换
        if (f.domain) {
            const domainIndex = domains.findIndex(dom => dom[type] === f.domain);
            if (domainIndex > -1) {
                const domain = domains[domainIndex];
                const mapping = mappings.filter(m => m.id === domain?.applyFor)[0];
                temp.domain = type === 'id' ? (domain.defName || domain.defKey) : f.domain;
                temp.len = domain.len === undefined ? '' : domain.len;
                temp.scale = domain.scale === undefined ? '' : domain.scale;
                temp.type = mapping?.[code] || '';
                temp.dbType = mapping?.[db] || f.type;
                temp.domainData = domain;
            }
        } else {
            temp.type = mappings.filter(m => m[db] === f.type)[0]?.[code] || f.type;
            temp.dbType = f.type;
        }
    }
    // 转换数据字典
    if (f.refDict && !omitName.includes('refDict')) {
        const dictIndex = dicts.findIndex(d => d[type] === f.refDict);
        const dict = dicts[dictIndex];
        temp.refDict = dict?.defName || dict?.defKey;
        temp.refDictData = dict || {};
    }
    // 转换UI建议
    if (f.uiHint) {
        const uiHintIndex = uiHints.findIndex(u => u[type] === f.uiHint);
        if(uiHintIndex > -1) {
            const uiHint = uiHints[uiHintIndex];
            temp.uiHint = uiHint?.defName || uiHint?.defKey;
            temp.uiHintData = uiHint;
        }
    }
    // 转换引用数据表  如果是视图
    if (entities && f.refEntity) {
        const entityIndex = entities.findIndex(e => e[type] === f.refEntity);
        if (entityIndex > -1) {
            const entity = entities[entityIndex];
            const fieldIndex = (entity.fields || []).filter(fie => f.refEntityField === fie[type])[0];
            temp.refEntity = entity.defKey || '';
            if(fieldIndex > -1) {
                const field = entity.fields[fieldIndex];
                temp.refEntityField = field?.defKey || '';
            }
        }
    }
    return temp;
};


export const _camel = (str, firstUpper) => {
    let ret = str.toLowerCase();
    ret = ret.replace( /_([\w+])/g, function( all, letter ) {
        return letter.toUpperCase();
    });
    if(firstUpper){
        ret = ret.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
            return $1.toUpperCase() + $2;
        });
    }
    return ret;
};

export const _getDefaultEnv = (e) => {
    return {
        ...(e.env || {}),
        base: {
            ...(e.env?.base || {}),
            nameSpace: e.env?.base?.nameSpace || '',
            codeRoot: e.env?.base?.codeRoot || _camel(e.defKey, true),
        }
    }
}

export const _getMessage = ({lang = 'zh', id, defaultMessage, format, data}) => {
    const reg = /\{(\w+)\}/g; // 国际化变量替换 格式为 {变量名} data中的变量名与之匹配
    const langData = allLangData[lang];
    const message = _.get(langData, id, defaultMessage);
    const defaultFormat = () => {
        if (data) {
            return message.replace(reg, (...replaces) => {
                return data[replaces[1]];
            });
        }
        return message;
    };
    return format ? format(message) : defaultFormat();
};

export const _getEmptyMessage = (name, dataSource, code) => {
    // 数据库[MySQL]的版本模板[增加字段]没有维护
    const support = _.get(dataSource, 'profile.dataTypeSupports', []).filter(s => s.id === code)[0];
    return `# ${_getMessage({
        id: 'versionData.templateEmpty',
        data: {
            name: support?.defKey || code,
            type: _getMessage({id: `tableTemplate.${name}`})
        }
    })}`;
};
export const _getTemplateString = (template, templateData, isDemo, dataSource , code) => {
    const underline = (str, upper) => {
        const ret = str.replace(/([A-Z])/g,"_$1");
        if(upper){
            return ret.toUpperCase();
        }else{
            return ret.toLowerCase();
        }
    };
    const upperCase = (str) => {
        return str.toLocaleUpperCase();
    };
    const lowerCase = (str) => {
        return str.toLocaleLowerCase();
    };
    const join = (...args) => {
        if(args.length<=2)return args[0];
        const datas = [];
        const delimter = args[args.length-1];
        for(let i=0;i<args.length-1;i++){
            if(/^\s*$/.test(args[i]))continue;
            datas.push(args[i]);
        }
        return datas.join(delimter);
    };
    const objectkit = {
        isJSON: function(obj) {
            var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
            return isjson;
        },
        deepClone: function(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        equals: function(v1, v2) {
            if (typeof(v1) === "object" && objectkit.isJSON(v1) && typeof(v2) === "object" && objectkit.isJSON(v2)) {
                return JSON.stringify(v1) == JSON.stringify(v2);
            } else {
                return v1 == v2;
            }

        }
    };
    const getIndex = (array, arg, n) => {
        var i = isNaN(n) || n < 0 ? 0 : n;
        for (; i < array.length; i++) {
            if (array[i] == arg) {
                return i;
            } else if (typeof(array[i]) === "object" && objectkit.equals(array[i], arg)) {
                return i;
            }
        }
        return -1;
    };
    const contains = (array, obj) => {
        return getIndex(array, obj) >= 0;
    };
    const uniquelize = (array) => {
        var copy = clone(array);
        const temp = [];
        for (var i = 0; i < copy.length; i++) {
            if (!contains(temp, copy[i])) {
                temp.push(copy[i]);
            }
        }
        return temp;
    };
    const clone = (array) => {
        var cloneList = Array();
        for (var i = 0, a = 0; i < array.length; i++) {
            cloneList.push(array[i]);
        }
        return cloneList;
    };
    const each = (array, fn) => {
        fn = fn || Function.K;
        var a = [];
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < array.length; i++) {
            var res = fn.apply(array, [array[i], i].concat(args));
            if (res != null) a.push(res);
        }
        return a;
    };
    const intersect = (array1, array2) => {
        // 交集
        const copy = clone(array1);
        const r = each(uniquelize(copy), function(o) { return contains(array2, o) ? o : null });
        return [].concat(r);
    };
    const union = (array1, array2) => {
        var copy = clone(array1);
        var r = uniquelize(copy.concat(array2));
        return [].concat(r);
    };
    const minus = (array1, array2) => {
        var copy = clone(array1);
        var r = each(uniquelize(copy), function(o) { return contains(array2, o) ? null : o });
        return [].concat(r);
    };
    const tplText = template.replace(/(^\s*)|(\s*$)/g, "");
    const getCode = () => {
        return code || _.get(dataSource, 'profile.default.db', dataSource.profile?.dataTypeSupports[0]?.id);
    }
    const getTemplate = () => {
        const allTemplate = _.get(dataSource, 'profile.codeTemplates', []);
        return allTemplate.filter(t => t.applyFor === getCode())[0] || {};
    };
    const currentEntityIndexRebuildDDL = (baseInfo, newIndexes = [], fields = [], type = 'entity') => {
        const codeTemplate = getTemplate();
        const data = isDemo ? demoTable.entity : {...baseInfo, fields, indexes: newIndexes};
        return `${_getTemplateString(codeTemplate.deleteIndex || _getEmptyMessage('deleteIndex', dataSource, getCode()), {
            [type]: {
                ...data,
                env: _getDefaultEnv(data),
            },
            separator: templateData.sqlSeparator,
        })}${_getTemplateString(codeTemplate.createIndex || _getEmptyMessage('createIndex', dataSource, getCode()), {
            [type]: {
                ...data,
                env: _getDefaultEnv(data),
            },
            separator: templateData.sqlSeparator,
        })}`
    }
    const currentEntityDropDDL = (data, type = 'entity') => {
        const codeTemplate = getTemplate();
        return _getTemplateString(codeTemplate.deleteTable || _getEmptyMessage('deleteTable', dataSource, getCode()), {
            [type]: { defKey: isDemo ? demoTable.entity.defKey : data.defKey },
            type,
            separator: templateData.sqlSeparator,
        });
    };
    const currentEntityCreateDDL = (data, type = 'entity') => {
        const codeTemplate = getTemplate();
        const name = type === 'entity' ? 'createTable' : 'createView';
        return _getTemplateString(codeTemplate[name] || _getEmptyMessage(name, dataSource, getCode()), {
            [type]: isDemo ? demoTable.entity : {
                ...data,
                env: _getDefaultEnv(data),
            },
            separator: templateData.sqlSeparator,
        });
    }
    const conf = {
        evaluate:    /\{\{([\s\S]+?)\}\}/g,
        interpolate: /\{\{=([\s\S]+?)\}\}/g,
        encode:      /\{\{!([\s\S]+?)\}\}/g,
        use:         /\{\{#([\s\S]+?)\}\}/g,
        define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
        conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
        iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
        varname: 'it',
        strip: false,
        append: true,
        doNotSkipEncoded:false,
        selfcontained: false
    };
    let resultText = doT.template(tplText, conf)({
        ...templateData,
        func: {
            camel: _camel,
            underline: underline,
            upperCase: upperCase,
            lowerCase: lowerCase,
            join: join,
            intersect: intersect,
            union: union,
            minus: minus,
            indexRebuildDDL: currentEntityIndexRebuildDDL,
            dropDDL: currentEntityDropDDL,
            createDDL: currentEntityCreateDDL,
        }
    });
    resultText = resultText.replace(/\n(\n)*( )*(\n)*\n/g,"\n");  //删除空行
    resultText = resultText.replace(/\r\n(\r\n)*( )*(\r\n)*\r\n/g,"\r\n"); //(不同操作系统换行符有区别)删除空行
    resultText = resultText.replace(/\$blankline/g,'');              //单独处理需要空行的情况
    return resultText;
};

export const _getDataByChanges = (changes, dataSource, lang = 'zh') => {
    try {
        const code = _.get(dataSource, 'profile.default.db', dataSource.profile?.dataTypeSupports[0]?.id);
        const allTemplate = _.get(dataSource, 'profile.codeTemplates', []);
        const codeTemplate = allTemplate.filter(t => t.applyFor === code)[0] || {};
        const sqlSeparator = _.get(dataSource, 'profile.sql.delimiter', ';');
        let sqlString = _getTemplateString(codeTemplate.update || _getDefaultTemplate(code, 'update', dataSource, lang), {
            changes,
            separator: sqlSeparator,
        }, false, dataSource, code);
        // const DDLToggleCase = dataSource?.profile?.DDLToggleCase || '';
        // if (DDLToggleCase) {
        //   return DDLToggleCase === 'U' ? sqlString.toLocaleUpperCase() : sqlString.toLocaleLowerCase();
        // }
        return sqlString;
    } catch (e) {
        console.log(e);
        return JSON.stringify(e.message, null, 2);
    }
};

export const _mergeData = (pre, next, needOld, merge = true, mergeNames) => {
    // 如果defKey相同，那么数据唯一标识将沿用，其余将使用后者覆盖
    if(Array.isArray(pre)) {
        return next.reduce((a, b, i) => {
            const temp = [...a];
            const index = pre.findIndex(p => (p.defKey === b.defKey) || (p.id === b.id));
            if (!b.defKey) {
                temp[i] = _mergeData(temp[i], b, needOld, merge);
            } else if (index < 0) {
                return temp.concat(b);
            } else {
                temp[index] = _mergeData(temp[index], b, needOld, merge);
            }
            return temp;
        }, pre);
    } else if (typeof pre === 'object' && pre !== null) {
        const otherData = {};
        if (pre.id) {
            otherData.id = pre.id;
            if (needOld) {
                otherData.old = next.id;
            }
        }
        const tempKeys = [...new Set(Object.keys(next).concat(Object.keys(pre)))];
        const allKeys = mergeNames? mergeNames(pre, next, tempKeys) : tempKeys;
        return {
            ...pre,
            ...allKeys.reduce((a, b) => {
                return {
                    ...a,
                    [b]: pre[b] === undefined ? next[b] :
                        (next[b] === undefined ? pre[b] : _mergeData(pre[b], next[b], false, merge)),
                };
            }, {}),
            ...otherData,
        };
    }
    //console.log(merge ? next : pre);
    return merge ? next : pre;
};

export const _mergeDataSource = (oldDataSource, newDataSource, selectEntity, ignoreProps) => {
    // 合并项目
    // 合并数据类型/代码模板/数据类型匹配
    // 计算新增和更新的数据
    const dataTypeSupports = oldDataSource.profile?.dataTypeSupports || [];
    const newDataTypeSupports = (newDataSource.profile?.dataTypeSupports || []);
    const tempDataTypeSupports = _mergeData(dataTypeSupports, newDataTypeSupports, true, false);
    // 合并代码模板
    const codeTemplates =  oldDataSource.profile?.codeTemplates || [];
    const newCodeTemplates = (newDataSource.profile?.codeTemplates || []);
    const tempCodeTemplates = _mergeData(
        codeTemplates.map(c => ({...c, defKey: c.applyFor, id: c.applyFor})),
        newCodeTemplates.map(c => ({...c, defKey: c.applyFor, id: c.applyFor})), false, true)
        .map(t => {
            const newApplyFor = tempDataTypeSupports.filter(s => s.old === t.applyFor)[0];
            if (newApplyFor) {
                return _.omit({
                    ...t,
                    apply: newApplyFor.id,
                }, ['defKey', 'id']);
            }
            return _.omit(t, ['defKey', 'id']);
        });
    // 合并UI建议
    const uiHint = oldDataSource.profile?.uiHint || [];
    const newUiHint = newDataSource.profile?.uiHint || [];
    const tempUiHint = _mergeData(uiHint, newUiHint, true, false);
    // 合并数据字典
    const dicts = oldDataSource?.dicts || [];
    const newDicts = newDataSource?.dicts || [];
    const tempDicts = _mergeData(dicts, newDicts, true, false);
    // 合并类型匹配
    const mappings = oldDataSource.dataTypeMapping?.mappings || [];
    const newMappings = newDataSource.dataTypeMapping?.mappings || [];
    const tempMappings = _mergeData(mappings, newMappings, true, false);
    // 合并数据域
    const domains = oldDataSource.domains || [];
    const newDomains = newDataSource.domains || [];
    const tempDomains = _mergeData(domains, newDomains, true, false);
    // 合并数据表
    const entities = oldDataSource.entities || [];
    const newEntities = (selectEntity || []).map(e => ({
        ...e,
        isNew: true,
        properties: e.properties || oldDataSource?.profile?.default?.entityInitProperties || {},
        fields: (e.fields || []).map(f => ({
            ...f,
            extProps: f.extProps || oldDataSource?.profile?.extProps || {}
        })),
    }));
    const ignoreCaseEntities = (entities, newEntities) => {
        return newEntities.map((d) => {
            const currentData = (entities || [])
                .filter(e => e.defKey?.toLocaleLowerCase() === d.defKey?.toLocaleLowerCase())[0];
            if (currentData) {
                return {
                    ...d,
                    defKey: currentData.defKey,
                    fields: (d.fields || []).map((f) => {
                        const currentField = (currentData.fields || [])
                            .filter(e => e.defKey?.toLocaleLowerCase() === f.defKey?.toLocaleLowerCase())[0];
                        if (currentField) {
                            return {
                                ...f,
                                defKey: currentField.defKey,
                            };
                        }
                        return f;
                    }),
                };
            }
            return d;
        });
    };
    const tempEntities = _mergeData(entities, ignoreCaseEntities(entities, newEntities),
        true, true, (p, n, keys) => {
            if(ignoreProps) {
                // 来自非项目数据的合并 需要挑选数据合并 防止其他无效数据覆盖
                const ignoreKeys = ['notes', 'extProps'];
                return keys.filter(k => !ignoreKeys.includes(k));
            }
            return keys;
        });
    // 合并视图(直接追加，不合并)
    const views = oldDataSource.views || [];
    const newViewsKeys = views.map(d => d.defKey);
    const newViews = (newDataSource.views || []).map(d => {
        let defKey = d.defKey;
        if (newViewsKeys.includes(defKey)) {
            defKey = `${defKey}_1`;
            newViewsKeys.push(defKey);
        }
        return {
            ...d,
            old: d.id,
            id: Math.uuid(),
            defKey,
            fields: (d.fields || []).map(f => {
                if (f.refEntity) {
                    const currentEntityId = tempEntities.filter(e => e.old === f.refEntity)[0]?.id;
                    return {
                        ...f,
                        refEntity: currentEntityId || f.refEntity
                    }
                }
                return f;
            })
        }
    });
    const tempViews = views.concat(newViews);
    const isUpdateEntity = tempEntities.filter(e => e.old);

    const getCurrentEntity = (eId, fId, type) => {
        let tempData = {
            id: eId,
            refField: fId,
        }
        const newData = type === 'entity' ? newEntities : [];
        const refEntityDataIndex = newData.findIndex(e => e.id === eId);
        if (refEntityDataIndex > -1) {
            // 数据来源至新表 需要更新新表的ID和字段的ID
            const refEntityData = newData[refEntityDataIndex]; // 新表
            const currentData = type === 'entity' ? isUpdateEntity : [];
            // 查找改表是否存在变更
            const refEntityIndex = currentData.findIndex(e => e.defKey === refEntityData.defKey);
            if (refEntityIndex > -1) {
                const refEntity = currentData[refEntityIndex]; // 获取新的表数据
                const refFieldKeyIndex = (refEntityData.fields || []).findIndex(f => f.id === fId);
                // 获取旧的字段
                const refFieldKey = (refEntityData.fields || [])[refFieldKeyIndex]?.defKey;
                const refFieldIndex = (refEntity.fields || []).findIndex(f => f.defKey === refFieldKey);
                // 获取新的字段
                const refField = (refEntity.fields || [])[refFieldIndex]?.id;
                if (refField) {
                    tempData = {
                        id: refEntity.id,
                        refField,
                    }
                }
            }
        }
        // 来源至非变更表 使用原始数据
        return tempData;
    };
    // 合并关系图(直接追加，不合并)
    const diagrams = oldDataSource.diagrams || [];
    const diagramsKeys = diagrams.map(d => d.defKey);
    const newDiagrams = (newDataSource.diagrams || []).map(d => {
        let defKey = d.defKey;
        if (diagramsKeys.includes(defKey)) {
            defKey = `${defKey}_1`;
            diagramsKeys.push(defKey);
        }
        return {
            ...d,
            old: d.id,
            id: Math.uuid(),
            defKey,
            canvasData: {
                ...d.canvasData,
                cells: (d.canvasData?.cells || []).map(c => {
                    if (c.shape === 'table') {
                        return {
                            ...c,
                            originKey: tempEntities.filter(r => r.old === c.originKey)[0]?.id || c.originKey,
                        };
                    } else if(c.shape === 'erdRelation') {
                        const getPort = ({cell, port}) => {
                            const sourceOriginKey = (d.canvasData?.cells || []).filter(c => c.id === cell)[0];
                            return getCurrentEntity(sourceOriginKey.originKey, port.split(separator)[0], 'entity');
                        }
                        const sourcePort = getPort(c.source)?.refField;
                        const targetPort = getPort(c.target)?.refField;
                        return {
                            ...c,
                            source: {
                                ...c.source,
                                port: sourcePort ? `${sourcePort}${separator}out` : c.source.port
                            },
                            target: {
                                ...c.target,
                                port: targetPort ? `${targetPort}${separator}in` : c.target.port
                            },
                        }
                    }
                    return c;
                })
            }
        }
    });
    const tempDiagrams = diagrams.concat(newDiagrams);
    // 合并分组
    const removeGroupEntities = tempEntities.filter(e => e.old).map(e => e.id);
    const viewGroups = (oldDataSource.viewGroups || []);
    const newViewGroups = (newDataSource.viewGroups || []);
    const tempViewGroups = _mergeData(viewGroups, newViewGroups, true, false).map(g => {
        const currentGroupEntities = newEntities.filter(e => e.group === g.id || e.group === g.old)
            .map((newE) => {
                const data = tempEntities.filter(e => e.old === newE.id)[0]
                if (data) {
                    return data.id;
                }
                return newE.id;
            });
        const refEntities = (g.refEntities || [])
            .filter(id => !removeGroupEntities.includes(id));
        if (currentGroupEntities.length > 0) {
            return {
                ...g,
                refEntities: [...new Set(refEntities.concat(currentGroupEntities))]
            };
        }
        return {
            ...g,
            refEntities,
        };
    });
    const mergeGroupData = (v, name, data) => {
        const newV = newViewGroups.filter(g => g.defKey === v.defKey)[0]?.[name];
        if(newV) {
            return [...new Set((v[name] || []).concat(newV.map(n => {
                const oldIndex = data.findIndex(d => d.old === n);
                if (oldIndex > -1) {
                    return data[oldIndex].id;
                }
                return n;
            })))].filter(id => data.findIndex(d => d.id === id) > -1);
        }
        return v[name] || [];
    }
    const refactor = (d, type) => {
        let tempD = d;
        if(d.isNew) {
            // 新增或者合并的数据表 需要进行一系列的处理
            const calcField = (f, names, namesData) => {
                // 更新字段的数据域/数据字典等
                let tempField = {...f};
                names.forEach((n, i) => {
                    const nameData = (namesData[i] || []).filter(name => name.old === f[n])[0];
                    tempField = {
                        ...tempField,
                        [n]: nameData?.id || f[n] || '',
                    }
                });
                return tempField;
            }
            const newData = type === 'entity' ? newEntities : newViews;
            const currentIndex = newData.findIndex(e => e.id === d.old);
            const currentOldData = newData[currentIndex];
            const getCurrentFieldId = (fId) => {
                // 寻找新合并进来的数据 根据当前的字段名寻找新的字段ID
                if(currentOldData) {
                    const fieldIndex = (currentOldData.fields || [])
                        .findIndex(field => field.id === fId);
                    const fieldDef = currentOldData[fieldIndex]?.defKey;
                    if (fieldDef) {
                        const currentFieldIndex = (d.fields || [])
                            .findIndex(field => field.defKey === fieldDef);
                        return d.fields[currentFieldIndex]?.id;
                    }
                    return null;
                }
                return fId;
            }
            const correlations = d.correlations || [];
            const indexes = d.indexes || [];
            tempD = {
                ...d,
                correlations: correlations.map(c => {
                    const myField = getCurrentFieldId(c.myField);
                    const refEntity = getCurrentEntity(c.refEntity, c.refField, type);
                    if (myField && refEntity) {
                        return {
                            ...c,
                            myField,
                            refEntity: refEntity.id,
                            refField: refEntity.refField,
                        }
                    }
                    return null;
                }).filter(f => !!f),
                indexes: indexes.map(i => {
                    return {
                        ...i,
                        fields: (i.fields || []).map(f => {
                            const fieldDefKey = getCurrentFieldId(f.fieldDefKey);
                            if (fieldDefKey) {
                                return {
                                    ...f,
                                    fieldDefKey
                                }
                            }
                            return null;
                        }).filter(f => !!f),
                    }
                }),
                fields: (d.fields || []).map((f) => {
                    return {
                        ...calcField(f, ['uiHint', 'refDict', 'domain'], [tempUiHint, tempUiHint, tempDomains]),
                    }
                })
            }
        }
        return _.omit(tempD, ['old', 'group', 'isNew']);
    }
    return {
        ...oldDataSource,
        domains: tempDomains.map(d => {
            const mIndex = tempMappings.findIndex(t => t.old === d.applyFor);
            if (mIndex > -1) {
                return {
                    ..._.omit(d, 'old'),
                    applyFor: tempMappings[mIndex].id,
                };
            }
            return _.omit(d, 'old');
        }),
        dataTypeMapping: {
            ...oldDataSource.dataTypeMapping,
            mappings: tempMappings.map(m => {
                return _.omit(Object.keys(m).reduce((p, n) => {
                    const mIndex = tempDataTypeSupports.findIndex(t => t.old === n);
                    if (mIndex > -1) {
                        return {
                            ...p,
                            [tempDataTypeSupports[mIndex].id]: m[n],
                        };
                    }
                    return {
                        ...p,
                        [n]: m[n],
                    };
                }, _.pick(m, ['defKey', 'id', 'defName'])), 'old');
            })
        },
        dicts: tempDicts.map(t => _.omit(t, 'old')),
        profile: {
            ...oldDataSource.profile,
            codeTemplates: tempCodeTemplates,
            dataTypeSupports: tempDataTypeSupports.map(t => _.omit(t, 'old')),
            uiHint: tempUiHint.map(t => _.omit(t, 'old')),
        },
        entities: tempEntities.map(e => refactor(e, 'entity')),
        views: tempViews.map(e => refactor(e, 'view')),
        diagrams: tempDiagrams.map(t => _.omit(t, ['old'])),
        viewGroups: tempViewGroups.map(v => {
            return _.omit({
                ...v,
                refViews: mergeGroupData(v, 'refViews', tempViews),
                refDiagrams: mergeGroupData(v, 'refDiagrams', tempDiagrams),
                refDicts: mergeGroupData(v, 'refDicts', tempDicts),
                refEntities: mergeGroupData(v, 'refEntities', tempEntities),
            }, 'old')
        }).map(v => {
            if ((oldDataSource.viewGroups || []).findIndex(g => g.defKey === v.defKey) < 0) {
                const names = ['refViews', 'refDiagrams', 'refDicts', 'refEntities'];
                // 清除新增的空分组
                if (names.some(n => (v[n] || []).length !== 0)) {
                    return v;
                }
                return null;
            }
            return v;
        }).filter(v => !!v),
    };
};

export const getAllData = (params) => {
    const data = params.dataSource;
    const getGroup = (type, d) => {
        return (data.viewGroups || [])
            .filter(g => (g[type] || []).includes(d.id))
            .map(g => ({
                name: g.defName || g.defKey || '',
                defKey: g.defKey,
                id: g.id,
            }));
    };
    const entityData = (data.entities || [])
        .map(e => ({...e, type: 'refEntities'}))
        .concat((data.views || []).map(v => ({...v, type: 'refViews'})))
        .map((b) => {
            return {
                ...b,
                groups: getGroup(b.type, b),
            };
        });
    const dictData = (data.dicts || []).map((d) => {
        const groups = getGroup('refDicts', d);
        return {
            ...d,
            type: 'refDicts',
            groups,
        };
    });
    return [
        {
            key: 'entities',
            data: entityData.map((e) => {
                const groups = e.groups.map(g => g.name).join('|');
                return {
                    ...e,
                    suggest: `${e.defKey}-${e.defName}${groups ? `@${groups}` : ''}`,
                };
            }),
        },
        {
            key: 'fields',
            data: entityData.reduce((a, b) => {
                return a.concat((b.fields || []).map((f) => {
                    // 模块名（没有则省略）/表(视图）代码[表显示名] /字段代码[字段显示名]
                    const groups = b.groups.map(g => g.name).join('|');
                    return {
                        ...f,
                        type: b.type,
                        groups: b.groups,
                        entity: b.id,
                        suggest: `${f.defKey}-${f.defName}@${b.defKey}-${b.defName}${groups ? `@${groups}` : ''}`,
                    };
                }));
            }, []),
        },
        {
            key: 'dicts',
            data: dictData.map((d) => {
                const groups = d.groups.map(g => g.name).join('|');
                return {
                    ...d,
                    suggest: `${d.defKey}-${d.defName}${groups ? `@${groups}` : ''}`,
                };
            }),
        },
        {
            key: 'dictItems',
            data: dictData.reduce((a, b) => {
                return a.concat(b.items.map((i) => {
                    const groups = b.groups.map(g => g.name).join('|');
                    return {
                        ...i,
                        type: b.type,
                        groups: b.groups,
                        dict: b.id,
                        suggest: `${i.defKey}-${i.defName}@${b.defKey}-${b.defName}${groups ? `@${groups}` : ''}`,
                    };
                }));
            }, []),
        },
        {
            key: 'standardFields',
            data: (data.standardFields || []).reduce((a, b) => {
                return a.concat(b.fields.map((f) => {
                    return {
                        ...f,
                        groups: [{id: b.id, name: b.id}],
                        suggest: `${f.defKey}-${f.defName}@${b.defKey}-${b.defName}`,
                    };
                }));
            }, []),
        },
    ];
};

export const _getAllDataSQLByFilter = (data, code, filterTemplate, filterDefKey) => {
    // 获取项目的一些配置信息
    const getDataSourceProfile = (data) => {
        const dataSource = {...data};
        const datatype = _.get(dataSource, 'dataTypeMapping.mappings', []);
        const allTemplate = _.get(dataSource, 'profile.codeTemplates', []);
        const sqlSeparator = _.get(dataSource, 'profile.sql.delimiter', ';') || ';';
        return {
            dataSource,
            datatype,
            allTemplate,
            sqlSeparator
        };
    };
    // 获取全量脚本（删表，建表，建索引，表注释）
    const { dataSource, allTemplate, sqlSeparator } = getDataSourceProfile(data);
    const entities = dataSource.entities || [];
    const getTemplate = (templateShow) => {
        return allTemplate.filter(t => t.applyFor === code)[0]?.[templateShow] || '';
    };
    const getFilterData = (name) => {
        return (dataSource[name] || []).filter(e => {
            if (filterDefKey) {
                return (filterDefKey[name] || []).includes(e.id);
            }
            return true;
        }).map(e => ({
            ...e,
            datatype: name,
            groupType: `ref${firstUp(name)}`
        }));
    };
    let sqlString = '';
    try {
        const tempData = code === 'dictSQLTemplate' ? getFilterData('dicts') : getFilterData('entities')
            .concat(getFilterData('views'));
        sqlString += tempData.map(e => {
            const tempTemplate = [...filterTemplate];
            let tempData = '';
            let data;
            if (code === 'dictSQLTemplate') {
                data = {
                    dict: _.omit(e, ['groupType', 'datatype']),
                }
            } else {
                const name = e.datatype === 'entities' ? 'entity' : 'view';
                const childData = {
                    ..._.omit(e, ['groupType', 'datatype']),
                    env: _getDefaultEnv(e),
                    fields: (e.fields || []).map(field => {
                        return {
                            ...field,
                            ..._transform(field, dataSource, code)
                        }
                    }),
                    indexes: (e.indexes || []).map(i => {
                        return {
                            ...i,
                            fields: (i.fields || []).map(f => {
                                const field = (e.fields || []).find(ie => f.fieldDefKey === ie.id);
                                return {
                                    ...f,
                                    fieldDefKey: field?.defKey || '',
                                };
                            })
                        }
                    }),
                    correlations: (e.correlations || []).map(c => {
                        const refEntityData = entities.find(r => r.id === c.refEntity);
                        return {
                            ...c,
                            myField: (e.fields || []).find(field => field.id === c.myField)?.defKey,
                            refEntity: refEntityData?.defKey,
                            refField: (refEntityData.fields || []).find(field => field.id === c.refField)?.defKey,
                        }
                    })
                };
                if (name === 'view') {
                    childData.refEntities = dataSource?.entities
                        ?.filter(e => childData?.refEntities.includes(e.id))
                        ?.map(e => e.defKey);
                }
                data = {
                    entity: childData,
                    view: childData,
                }
            }
            const templateData = {
                ...data,
                group: (dataSource.viewGroups || [])
                    .filter(g => (g[e.groupType] || []).includes(e.id))
                    .map(g => _.pick(g, ['defKey', 'defName'])),
                separator: sqlSeparator
            };
            if (tempTemplate.includes('createTable')) {
                tempTemplate.push('createView');
            }
            tempTemplate.filter(t => {
                if (e.datatype === 'entities') {
                    return t !== 'createView';
                }
                return t !== 'createTable';
            }).forEach(f => {
                const code = `${_getTemplateString(getTemplate(f), templateData)}`;
                tempData += code ? `${code}\n` : '';
            });
            return tempData;
        }).join('');
    } catch (e) {
        sqlString = JSON.stringify(e.message);
    }
    // const DDLToggleCase = dataSource?.profile?.DDLToggleCase || '';
    // if (DDLToggleCase) {
    //   return DDLToggleCase === 'U' ? sqlString.toLocaleUpperCase() : sqlString.toLocaleLowerCase();
    // }
    return sqlString;
};
