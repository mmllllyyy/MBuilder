export default {
    system: {
        title: 'PDManer',
        template: '当前项目为模板项目',
        err: '出错了',
        errorMessage: '程序出现异常，请前往日志文件查看出错日志：',
        readingMode: '只读模式',
    },
    toolbar: {
        save: '保存',
        refresh: '刷新',
        saveAs: '另存为',
        undo: '撤销',
        redo: '重做',
        opt: '操作',
        selection: '选择/移动',
        resetScale: '重置为100%',
        map: '小地图',
        relation: '关联',
        emptyEntity: '新建空表',
        alignment: '对齐',
        tool: '快捷工具',
        toggleCase: '大小写转换',
        compareDb: '模型对比数据库',
        compareTable: '模型内自定义表对比',
        themeDay: '白天模式',
        themeNigh: '夜间模式',
        alignLeft: '左对齐',
        horizontalCenter: '水平居中',
        alignRight: '右对齐',
        alignTop: '顶端对其',
        verticalCenter: '垂直居中',
        alignBottom: '底端对其',
        alignRow: '横向分布',
        alignColumn: '纵向分布',
        shape: '形状',
        rect: '矩形',
        round: '圆角矩形',
        circle: '圆形',
        polygon: '菱形',
        mind: '思维导图',
        layout: '布局',
        fontColor: '字体颜色',
        fillColor: '填充颜色',
        scale: '比例',
        import: '导入',
        importPDMan: '导入PDMan文件',
        importCHNR: '导入CHNR文件',
        importPDManer: '导入PDManer文件',
        importPowerDesigner: '导入PowerDesigner文件',
        importDb: '从数据库导入',
        importExcel: '从EXCEL导入',
        importDomains: '导入类型设置',
        importAppCodes: '导入代码生成器',
        exportDomains: '导出类型设置',
        exportAppCodes: '导出代码生成器',
        export: '导出',
        exportConfig: '导出系统设置',
        importConfig: '导入系统设置',
        exportDicts: '导出数据字典',
        importDicts: '导入数据字典',
        importDDL: '导入DDL',
        exportImg: '导出当前画布为图片',
        exportImgLoading: '正在导出当前画布为图片...',
        exportSql: '导出DDL',
        exportDict: '导出数据字典SQL',
        exportWord: '导出WORD',
        exportHtml: '导出HTML',
        exportMarkdown: '导出Markdown',
        exportWordStep1: '[1/2] 1.正在生成关系图...[{count}/{length}]',
        exportWordStep2: '[2/2] 2.正在生成WORD...',
        exportSuccess: '导出成功！',
        exportPath: '导出文件位于："{path}"',
        setting: '设置',
        dicts: '数据字典',
        dbConnect: '数据库',
        search: '数据表/多表透视/数据字典',
        create: '新建',
        open: '打开',
        relationEnableTitle: '该功能仅在当前激活的tab页为关系图下可用',
        group: '分组',
        history: '操作历史',
    },
    createProject: '创建新项目...',
    renameProject: '修改项目信息...',
    deleteProject: '删除项目...',
    invalidProjectFile: '无效的项目文件',
    invalidProjectData: '无效的chnr文件，请先新建项目再执行导入操作！请勿直接修改项目后缀！',
    invalidPdmFile: '无效的pdm文件',
    invalidDDLFile: '无效的sql文件',
    invalidDomainsFile: '无效的数据域文件',
    invalidDictsFile: '无效的数据字典文件',
    invalidConfigFile: '无效的设置文件',
    invalidPDManFile: '无效的PDMan文件',
    invalidCHNRFile: '无效的CHNR文件',
    invalidPDManerFile: '无效的PDManer文件',
    invalidAppCodesFile: '无效的程序代码文件',
    createProjectExists: '项目已经存在',
    saveProject: '保存项目信息...',
    readProject: '读取项目信息...',
    importPDMan: '导入PDMan项目信息...',
    updateConfig: '更新配置信息...',
    wait: '开发中,敬请期待...',
    openDir: '选择目录',
    openFile: '选择文件',
    openDirError: '目录选择失败',
    openFileError: '文件选择失败',
    saveSuccess: '保存成功',
    saveFail: '保存失败',
    emptyDefaultTemplate: '没有默认模板设置',
    project: {
        homeCover: '首页封面',
        entities: '数据表',
        views: '多表透视',
        diagram: '关系图',
        dicts: '数据字典',
        domains: '数据域',
        dataType: '类型设置',
        dataTypeMapping: '基本数据类型',
        dataTypeSupport: '数据库',
        default: '默认',
        name: '项目名',
        describe: '描述',
        path: '保存位置',
        createDate: '创建时间',
        updateDate: '更新时间',
        avatar: '图标',
        noAvatar: '暂无图标',
        pickAvatar: '从内置图标库中挑选',
        getProjectData: '获取项目信息。。。',
        getProjectDataError: '获取项目信息失败！项目文件不存在或者已经损坏！',
        avatarValidate: {
            placeholder: '像素为64*64，大小为10KB以内，可直接使用base64',
            validate: '无效的图片！大小不能超过10KB，图片像素为56*56',
        },
        appCode: '程序代码',
    },
    quick: {
        home: '打开首页封面',
        save: '保存项目',
        toggleCase: '大小写转换',
        drag: '关系图界面，按住Ctrl/Command + 拖动鼠标，可拖动画布',
        minimap: '关系图界面，按住Ctrl/Command + M，可开关小地图',
        find: '关系图界面，按住Ctrl/Command + F，可开关搜索功能',
    },
    welcome: '欢迎使用',
    welcomeVersionTitle: '检测版本信息...',
    newVersion: '发现新版本',
    update: '立即更新',
    download: '正在下载最新版本...',
    newVersionError: '版本下载失败，请尝试点击下载链接手动下载',
    version: {
        number: '新版本号',
        date: '更新时间',
        log: '更新日志',
        download: '下载地址',
    },
    home: {
        project: '项目',
        allProject: '全部项目',
        jumpOptBook: '点击跳转至在线文档',
        optBook: '操作手册',
        optBookTitle: '扫描下方二维码阅读文档',
        optBookTitle1: '微信扫码',
        optBookTitle2: '微信小程序',
        recently: '最近打开',
        exampleProject: '参考模板',
        search: '项目名/项目描述',
        createProject: '新建项目',
        editProject: '编辑项目',
        proInfo: '项目信息',
        proConfig: '项目配置',
        openProject: '双击打开项目',
        removeHistory: '移除',
        openReading: '以只读模式打开',
        removeProject: '文件物理删除',
        page: '官方网站',
    },
    openProject: '打开项目',
    optFail: '操作失败',
    optSuccess: '操作成功',
    optEnd: '操作结束',
    uniqueKeyError: '该字段不可重复，请修改',
    emptyField: '<空字段>',
    entityUniqueKeyError: '数据表中包含重复字段，请修改,重复字段有[{entities}]',
    entityUniqueDefKeyError: '数据表或多表透视已经存在，请修改,重复数据表或多表透视有[{entities}]',
    entityHideInGraphSizeError: '关系图显示字段请选择能够代表本表业务含义的典型属性字段，限制为[{size}]个,超限数据表有[{entities}]，如需修改，请通过："设置->系统参数->关系图最大展示字段数"进行修改',
    modify: '前往修改',
    formValidateMessage: '带星号为必输项，不能为空！',
    defKeyValidateMessage: '{name}代码不能为空',
    defKeyValidateUniquenessMessage: '代码不能为空且不可重复',
    entityAndViewUniquenessCheck: '必输项不能重复！',
    showGroup: '主题域模式',
    click: '点击',
    createGroup: '创建主题域',
    emptyGroup: '暂无主题域数据',
    createAppCode: '创建程序代码',
    emptyAppCode: '暂无程序代码',
    location: '定位到打开的标签页',
    moduleList: '数据模型',
    closeCurrent: '关闭当前',
    closeOthers: '关闭其他',
    closeAll: '关闭所有',
    menus: {
        opt: {
            add: '新增',
            delete: '删除',
            move: '改变主题域',
            copy: '复制',
            cut: '剪切',
            paste: '粘贴',
            clear: '清空',
            edit: '编辑',
            editRelation: '信息编辑',
            copyAll: '复制全部',
            all: '列出全部',
            reset: '恢复默认',
            rename: '重命名',
            notes: '标注',
            img: '导出图片',
        },
        groups: '主题域',
        entities: '数据表组',
        entity: '数据表',
        views: '多表透视组',
        view: '多表透视',
        diagrams: '关系图组',
        diagram: '关系图',
        dicts: '字典组',
        dict: '字典',
        domains: '数据域组',
        domain: '数据域',
        dataTypeMapping: '数据类型',
        mapping: '数据类型',
        dataTypeSupport: '数据库',
        dataType: '数据库',
        appCode: '程序代码',
        add: {
            newEntity: '新增数据表',
            newView: '新增多表透视',
            newViewMultipleSelect: '请选择数据表',
            newViewStep1: '选择表',
            newViewStep2: '选择字段',
            newViewStep3: '基本信息',
            newViewStepPre: '上一步',
            newViewStepNext: '下一步',
            newRelation: '新增关系图',
            newDict: '新增数据字典',
            newGroup: '新增主题域',
            newDomain: '新增数据域',
            newDataType: '新增数据类型',
            newDataTypeSupport: '新增数据库',
            newAppCode: '新增程序代码',
        },
        edit: {
            editRelation: '编辑关系图',
            editGroup: '编辑主题域',
            editDomain: '编辑数据域',
            editMapping: '编辑数据类型',
            editDataTypeSupport: '编辑数据库',
            editAppCode: '重命名程序代码',
        },
    },
    fieldRemarkDetail: '详细说明',
    copySuccess: '复制成功',
    copyFail: '复制失败',
    copyWarring: '无效的复制数据',
    cutSuccess: '剪切成功',
    cutWarring: '无效的剪切数据',
    pasteWarring: '无效的粘贴板数据',
    pasteSuccess: '粘贴成功',
    deleteSuccess: '删除成功',
    closeConfirmTitle: '退出项目确认',
    closeConfirm: '退出当前项目将会丢失所有未保存的数据，请确定已经执行保存操作！',
    exitConfirmTitle: '关闭确认',
    exitConfirm: '是否关闭软件？',
    saveConfirmTitle: '关闭确认',
    saveConfirm: '当前内容尚未保存，是否关闭？',
    refreshConfirmTitle: '刷新项目',
    refreshConfirm: '刷新当前项目将会丢失当前打开的项目数据，是否继续？',
    deleteConfirmTitle: '删除确认',
    importConfirm: '导入操作会覆盖当前项目是否继续？',
    deleteConfirm: '删除操作不可撤销是否继续？',
    resetConfirmTitle: '恢复确认',
    resetConfirm: '恢复操作不可撤销是否继续？',
    deleteFromDiskConfirm: '您将会将此文件从硬盘上删除，请问你确认删除吗？',
    deleteWarring: '无效的删除数据',
    clearConfirmTitle: '清空确认',
    clearConfirm: '清空操作不可撤销是否继续？',
    clearSuccess: '清空成功',
    moveSuccess: '移动成功',
    canvas: {
        opt: {
            undo: '撤销',
            redo: '重做',
            enlarge: '放大',
            narrow: '缩小',
            save: '保存',
            addNode: '增加节点',
            search: '搜索节点',
        },
        edge: {
            form: '连线起点',
            to: '连线终点',
            none: '无',
            arrow: '箭头',
            addEdgeMark: '增加锚点',
            removeEdgeMark: '删除锚点',
            removeEdge: '删除连接线',
            setRelation: '设置对应关系',
            editRelation: '编辑关系',
            relationLabel: '关系说明',
            brokenLine: '折线',
            straightLine: '直线',
            lineType: '线条类型',
            lineStyle: '线条样式',
            startArrow: '起点箭头',
            endArrow: '终点箭头',
            exchange: '交换',
        },
        node: {
            delete: '删除节点',
            entityHasOpen: '该数据表已被其他标签页占用!请关闭标签页或者把他拖到打开的数据表中!',
            entityJump: '请关闭占用的标签或者直接显示已',
            entityOpen: '打开',
            entityTab: '标签',
            defaultRemark: '双击输入内容',
            remarkPlaceholder: '请输入内容(支持Markdown)',
            extendError: '继承失败，该数据表无可见的主键',
            extendWarring: '该数据表与源表存在主键相连！无需继承！',
            find: '图上找表',
            internally: '内链',
            externally: '外链',
            linkType: '链接类型',
            link: '链接设置',
            linkAddress: '链接地址',
            linkAddressPlaceholder: 'http://www.baidu.com',
            linkContent: '链接内容',
            linkNone: '无',
            linkSearch: '数据表/多表透视/数据字典/关系图',
            invalidLink: '无效的链接',
            note: '备注',
            topicBranch: '分支主题',
            topic: '中心主题',
            comment: '画布批注',
            commentEmpty: '暂无批注',
            commentPlaceholder: '请输入画布批注，支持markdown',
            pasteWarring: '请先选中需要粘贴的主题',
        },
        title: '从左侧数据表中拖拽数据表至关系图中',
        isMin: '已经是最小倍数，不可缩小',
        isMax: '已经是最大倍数，不可放大',
        entity: '数据表',
        myColor: '我的颜色',
        default: '使用默认颜色',
        standardColor: '标准颜色',
        lock: '锁定',
        unLock: '解锁',
    },
    standardFields: {
        isStandard: '标准字段',
        standardFields: '标准字段库维护',
        groupNotAllowEmpty: '分类代码不能为空',
        groupAndFieldNotAllowRepeatAndEmpty: '分类或字段不能重复或为空',
        selectGroup: '选择分类',
        group: '主题域',
        groupName: '分类名',
        groupCode: '分类代码',
        dropFieldsSuccessResult: '成功{success}个:',
        dropFieldsShowResult: '其中显示{show}个',
        dropFieldsHiddenResult: '，隐藏的有{hidden}个',
        dropFieldsFailResult: '因重复失败{fail}个',
        fieldsLib: '字段库',
        standardFieldsLib: '标准字段库',
        standardFieldsLibSearch: '代码/名称',
        standardFieldsLibEmpty: '暂无数据',
        exportStandardFieldsLib: '导出',
        importStandardFieldsLib: '导入',
        editStandardFields: '编辑标准字段库',
        help: '字段库字段可以直接拖至数据表列表或关系图上的数据表中',
        errData: '无效的标准字段库数据',
        setting: '维护',
    },
    modelTab: '模型',
    domainTab: '类型设置',
    appCode: '代码生成器',
    versionTab: '版本管理',
    getUserConfigData: '正在获取用户配置信息...',
    button: {
        ok: '确定',
        cancel: '取消',
        test: '测试',
        close: '关闭',
        save: '保存',
        edit: '编辑',
        preview: '预览',
    },
    tableEdit: {
        database: '数据库方言:',
        columnSetting: '列设置',
        changeDb: '切换数据库方言',
        data: '数据表',
        dbDDL: '数据库代码',
        appCode: '程序代码',
        indexes: '索引',
        importFields: '引入',
        moveStart: '置顶',
        moveUp: '上移',
        moveDown: '下移',
        moveEnd: '置底',
        addField: '新增',
        deleteField: '删除',
        moveFieldLeft: '左移',
        moveFieldRight: '右移',
        exchangeCode: '大小写',
        showSelectedFields: '可见',
        hiddenSelectedFields: '隐藏',
        note: '标注',
        addStandardFields: '入库',
        addStandardFieldsMessage: '操作{count}条数据，因重复失败{fail}条',
        resetHeaders: '重置',
        expand: '展开',
        unExpand: '收起',
        opt: [
            '操作提示: ',
            '1. 单击行号选中当前行',
            '2. 按住Ctrl+单击行号，选中跳跃行',
            '3. 按住Shift+单击行号，选中连续行',
            '4. 选中行后，Ctrl+C复制，Ctrl+V粘贴',
            '5. 单元格内部使用Ctrl+Shift+U转换大小写',
            '6. 选择多行，能够批量调整数据域',
        ],
    },
    tableValidate: {
        invalidJsonData: '无效的JSON字符串！',
        invalidIndexes: '无效的索引数据！',
        invalidFields: '无效的字段数据！',
        selectedFieldsEmpty: '请选择字段',
    },
    tableBase: {
        type: '新建类型',
        empty: '空表',
        extend: '继承',
        parent: '父表',
        parentFields: '父表字段',
        parentFieldsCount: '当前已选择{count}个字段',
        other: '更多设置',
        fields: '字段明细',
        selectFields: '选择字段',
        defName: '显示名称',
        defKey: '代码',
        tableName: '表名',
        tableTitle: '表显示名',
        group: '所属主题域',
        properties: '自定义属性',
        propertyName: '属性名',
        propertyValue: '属性值',
        addPropertyCount: '增加{count}条属性',
        addFieldCount: '增加{count}条字段',
        nameTemplate: '显示方式',
        comment: '说明',
        pathAndEnv: '路径及变量',
        generate: '生成',
        pathAndEnvEdit: '设置路径及变量',
        baseConfig: '基础设置',
        savePath: '保存位置',
        savePathFromOther: '从其他表引入',
        savePathPlaceHolder: '文件所在位置',
        emptySavePath: '未配置文件保存位置，请先配置！',
        genFileSuccess: '文件生成成功！',
        select: '选择',
        nameSpace: 'nameSpace',
        nameSpacePlaceHolder: '如: cn.com.chiner.demo',
        customEnv: '自定义变量',
        add: '添加',
        codeRoot: 'codeRoot',
        codeRootPlaceHolder: '如: DemoPerson',
        templateConfig: '生成文件映射',
        template: '模板',
        dir: '目录',
        dirPlaceHolder: '相对于保存位置目录',
        suffix: '映射',
        saveAndGenerate: '确定并生成',
        table: '数据表',
        example: '例如：Java代码的Controller&Service&Mapper生成配置如下：',
        model: '模型数据',
        editTemplate: '编辑代码模板',
        emptyDefault: '未匹配到默认设置',
        useDefault: '设置为默认',
        search: '搜索数据表',
        selectEntityEmpty: '请选择数据表',
    },
    tableHeaders: {
        defName: '显示名称',
        defKey: '字段代码',
        remark: '说明',
        domain: '数据域',
        dbType: '数据类型',
        len: '长度',
        scale: '小数位数',
        primaryKey: '主键',
        notNull: '不为空',
        autoIncrement: '自增',
        defaultValue: '默认值',
        hideInGraph: '关系图',
        uiHint: 'UI建议',
        indexesName: '索引名',
        indexIsUnique: '是否唯一',
        indexComment: '描述',
        indexesFieldsName: '名称',
        ascOrDesc: '排序',
        indexesFieldKey: '代码',
        refEntity: '数据表',
        refDict: '数据字典',
        extProps: '拓展属性',
        ext: '拓展',
    },
    tableTemplate: {
        normal: '常规模板',
        version: '版本模板',
        createTable: '新建数据表代码',
        createView: '新建多表透视',
        createIndex: '新建索引代码',
        deleteIndex: '删除索引',
        deleteTable: '删除表/多表透视',
        renameTable: '变更表/多表透视',
        addField: '增加字段',
        deleteField: '删除字段',
        updateField: '修改字段',
        message: '提示文字',
        update: '版本变更代码',
    },
    domain: {
        defKey: '数据域代码',
        defName: '显示名称',
        applyFor: '数据类型',
        len: '长度',
        scale: '小数位数',
        type: '(当前)',
        emptyType: '未匹配到数据类型(未配置默认数据库/未配置默认数据库数据类型)',
    },
    dataType: {
        defKey: '类型代码',
        defName: '显示名称',
        defaultDb: '(默认)',
        defaultDbInfo: '检测到你未配置默认数据库，系统将自动为你指定默认数据库',
        dbDDL: '数据库',
        appCode: '程序代码',
    },
    appCodeData: {
        defKey: '程序代码',
        type: '代码模板',
        add: '不可使用applyFor/type两个关键字',
        validate: '代码模板不能重复或者为空',
    },
    versionData: {
        hasNew: '有了新变化',
        addNew: '记录新版本',
        useNew: '可以记录新版本了',
        name: '版本名',
        data: '版本说明',
        edit: '编辑版本信息',
        add: '新增版本',
        validate: '版本号不能重复或者为空',
        saveTitle: '正在保存版本信息...',
        saveError: '当前版本数据无法保存！',
        addData: '新增',
        deleteData: '删除',
        updateData: '修改',
        entity: '表',
        view: '多表透视',
        field: '字段',
        empty: '点击初始化基线版本',
        isDemo: '参考案例无法使用版本管理功能，请先执行保存操作！',
        index: '索引',
        indexField: '索引字段',
        templateEmpty: '数据库[{name}]的版本模板[{type}]没有维护',
        modelVersion: '模型版本',
        dbDiff: '数据库比对',
    },
    dict: {
        view: '查看',
        create: '创建数据字典',
        dictValidate: {
            invalidDictItems: '无效的条目数据！',
        },
        dictAndItemNotAllowRepeatAndEmpty: '字典代码或条目代码不能重复或者为空',
        defKey: '字典代码',
        defName: '显示名称',
        intro: '描述说明',
        items: '字典条目',
        base: '基本信息',
        enabled: '是',
        disabled: '否',
        item: {
            defKey: '条目代码',
            defName: '条目显示名称',
            parentKey: '父条目代码',
            sort: '排序码',
            intro: '条目描述',
            enabled: '是否启用',
            attr1: '拓展属性值1',
            attr2: '拓展属性值2',
            attr3: '拓展属性值3',
        },
    },
    view: {
        entityList: '数据表列表',
        selectEntity: '选择数据表',
        selectEntityMessage: '当前已经选择【{count}】个数据表',
        selectEntityIcon: '点击选择数据表',
        emptyEntityRefs: '未发现引入数据表，请先引入数据表再引入字段',
        importFields: '导入字段',
        fieldSearchPlaceholder: '字段代码/显示名称',
    },
    viewBase: {
        defKey: '多表透视代码',
        defName: '显示名称',
        viewName: '多表透视名',
        viewTitle: '多表透视显示名',
    },
    relation: {
        defKey: '关系图代码',
        relationType: '连线对象',
        relationEntity: '数据表',
        relationField: '字段',
        defName: '关系图名称',
        graphCanvas: '关系图',
    },
    database: {
        templateError: '数据库模板出错，请参考Dot.js配置模板信息',
        templateErrorLink: '请查阅这里',
        templateEdit: '模板配置',
        defKey: '数据库',
        type: '类型',
        defaultDbError: '默认数据库只能有一个',
        nameError: '数据库不能为空',
        defaultDb: '默认数据库',
        defaultTemplate: '系统自带代码模板',
        defaultDbMessage: '(勾选此项，将会在数据表和关系图中显示默认数据库的数据类型)',
        codeType: {
            dbDDL: '数据库定义语句',
            appCode: '程序代码',
        },
        templateEditOpt: {
            previewEdit: '预览编辑',
            getTemplateByDefaultOrRemote: '查看更多代码模板',
            useTemplate: '使用当前模板',
        },
        preview: {
            demoData: '参考数据',
            templateEdit: '模板编辑',
            dot: 'dot.js语法介绍',
            result: '预览结果',
        },
        dot: {
            address: '官网：https://github.com/olado/doT',
            learnAddress: '语法对照：参考地址：https://tech.meituan.com/dot.html',
            project: '项目',
            javascript: 'JavaScript语法',
            grammar: '对应语法',
            example: '案例',
            outputVariables: '输出变量',
            variable: '变量名',
            conditional: '条件判断',
            expression: '条件表达式',
            transition: '条件转折',
            loop: '循环',
            loopVariable: '循环变量',
            method: '执行方法',
            globalMethod: '全局方法：可以通过it.func.方法名使用',
            methodName: '方法名',
            methodFunction: '方法功能',
            parameter: '参数介绍',
            camel: {
                name: '下划线转驼峰',
                param: '参数1：需要转化的字符串，参数2：首字母是否需要大写',
            },
            underline: {
                name: '驼峰转下划线',
                param: '参数1：需要转化的字符串，参数2：是否全大写',
            },
            upperCase: {
                name: '全大写',
                param: '参数1：需要转化的字符串',
            },
            lowerCase: {
                name: '全小写',
                param: '参数1：需要转化的字符串',
            },
            join: {
                name: '多个字符串拼接',
                param: '不限参数，最后一个参数为拼接符',
            },
            intersect: {
                name: '两个数组交集',
                param: '参数1：数组1，参数2：数组2',
            },
            union: {
                name: '两个数组并集',
                param: '参数1：数组1，参数2：数组2',
            },
            minus: {
                name: '两个数组差集',
                param: '参数1：数组1，参数2：数组2；（数组1比数组2多出的数据）',
            },
            indexRebuildDDL: {
                name: '获取重建索引DDL',
                param: '-',
            },
            dropDDL: {
                name: '获取删除表/多表透视DDL',
                param: '-',
            },
            createDDL: {
                name: '获取创建表/多表透视DDL',
                param: '-',
            },
        },
    },
    config: {
        UiHint: 'UI建议选项',
        uiHint: {
            addCount: '增加{count}条UI建议',
            add: '新增',
            delete: '删除',
            moveUp: '上移',
            moveDown: '下移',
            defKey: 'UI建议值',
            defName: 'UI建议名',
        },
        column: {
            attr1: '拓展字段1',
            attr2: '拓展字段2',
            attr3: '拓展字段3',
            attr4: '拓展字段4',
            attr5: '拓展字段5',
            attr6: '拓展字段6',
            attr7: '拓展字段7',
            attr8: '拓展字段8',
            attr9: '拓展字段9',
        },
        enable: '启用',
        columnName: '列名',
        columnKey: '列值',
        hideInGraph: '显示与关系图',
        title: '设置',
        EntityInit: '表设置',
        EntityInitFields: '缺省字段',
        EntityInitColumn: '表头设置',
        EntityBasePropertiesList: '缺省属性',
        FieldConfig: '字段设置',
        FieldInitProp: '新字段默认扩展属性',
        JavaHomeConfigResult: {
            success: '配置成功',
            error: '配置失败',
            placeholder: '不填将自动从系统的环境变量中读取',
            notFoundJDK: '未检测到JDK，请先安装JDK(如果已经安装，请检查环境变量是否配置正确或者前往系统【设置】-> 【系统参数】->【JAVA_HOME】指定JDK路径)',
            outOfMemoryError: 'JVM所需内存不足，请前往[设置=>系统参数=>JVM参数]调整',
        },
        DictSQLTemplate: '数据字典SQL模板',
        JVMLabel: 'JVM参数',
        JVMPlaceholder: '多个参数请以空格分割',
        SystemParameter: '系统参数',
        DbConnect: '数据库连接配置',
        SqlDelimiterLabel: 'SQL分隔符',
        DocTemplatePlaceholder: '默认为系统自带的模板，如需修改，请先下载文档模版，再指定模板文件',
        DocTemplateSaveAs: '下载文档模版',
        PreviewModal: '数据模型',
        DocTemplatePicker: '选择文件',
        DocSave: '确定设置',
        language: {
            label: '语言',
            zh: '中文',
            en: '英文',
        },
        autoSave: {
            label: '自动保存',
            0: '关闭',
            2: '2分钟',
            5: '5分钟',
            10: '10分钟',
            20: '20分钟',
            30: '30分钟',
            60: '60分钟',
        },
        autoBackup: {
            label: '自动备份数量',
            0: '0',
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5',
        },
        ModelLabel: '模型默认显示模式',
        ModelLabelMessage: '(重启或重新打开项目后生效)',
        relationFieldSize: '关系图最多允许展示字段数',
        relationType: '关系图连线对象',
    },
    dbConnect: {
        log: '请查看日志文件,位于：',
        title: '数据库连接配置',
        defaultDbConnectDesc: '当前选择的默认数据库连接是：',
        defaultDbConnectEmpty: '当前暂无默认选择连接',
        titlePlaceholder: '连接描述',
        namePlaceholder: '连接名',
        customDriver: '自定义驱动',
        customDriverPlaceholder: '目前mysql,sqlserver,oracle,postgresql,db2,dm无需配置',
        driver: 'driver-class',
        url: 'url',
        username: 'username',
        password: 'password',
        test: '测试',
        add: '新增',
        delete: '删除',
        copy: '复制',
        demoDbConnect: {
            mysql: 'jdbc:mysql://IP地址:端口号/数据库名?characterEncoding=UTF-8&useSSL=false&useUnicode=true&serverTimezone=UTC',
            oracle: 'jdbc:oracle:thin:@IP地址:端口号/数据库名',
            sqlserver: 'jdbc:sqlserver://IP地址:端口号;DatabaseName=数据库名',
            postgresql: 'jdbc:postgresql://IP地址:端口号/数据库名',
            db2: 'jdbc:db2://IP地址:端口号/数据库名:progressiveStreaming=2',
            dm: 'jdbc:dm://IP地址:端口号/数据库名',
            guassdb: 'jdbc:postgresql://IP地址:端口号/数据库名',
            kingbase: 'jdbc:kingbase8://IP地址:端口号/数据库名',
            maxcompute: 'jdbc:odps:http://IP地址:端口号/api?project=项目名&accessId=ACCESS_ID&accessKey=ACCESS_KEY',
            sqlite: 'jdbc:sqlite:/path/db-file-name (MAC以及Linux) jdbc:sqlite://path/db-file-name (Windows)',
            GBase: 'jdbc:gbasedbt-sqli://IP地址:端口号/数据库名:GBASEDBTSERVER=gbasedbt-server;SQLMODE=GBase;DB_LOCALE=en_US.819;?metaFromSQL=1&schemaOwner=数据库名',
            oracle_all_tables: 'jdbc:oracle:thin:@IP地址:端口号/数据库名?metaFromSQL=1&schemaOwner=数据库名',
            mysql_schema: 'jdbc:mysql://IP地址:端口号/数据库名?characterEncoding=UTF-8&useSSL=false&useUnicode=true&serverTimezone=UTC&metaFromSQL=1&schemaOwner=数据库名',
            hive_MySQL: 'jdbc:mysql://IP地址:端口号/schema?useUnicode=true&characterEncoding=UTF-8&useSSL=false&metaDb=default&hive-meta=MySQL',
            hive_PostgreSQL: 'jdbc:postgresql://IP地址:端口号/metastore?metaDb=default&hive-meta=PostgreSQL',
            mysql_defKey: '1.MySQL',
            'mysql-information_schema_defKey': '2.MySQL(使用information_schema查询表结构)',
            oracle_defKey: '3.ORACLE',
            'oracle-all_tables_defKey': '4.ORACLE(通过all_tables进行查询表结构)',
            sqlserver_defKey: '5.SQLServer（官方驱动默认支持java8，如果您是其他版本的JDK，请自定义驱动）',
            postgresql_defKey: '6.PostgreSQL',
            postgresql_chema_defKey: '7.PostgreSQL(使用information_schema查询表结构)',
            postgresql_chema: 'jdbc:postgresql://IP地址:端口号/数据库名?metaFromSQL=1&schemaOwner=数据库名',
            db2_defKey: '8.DB2',
            dm_defKey: '9.DM(达梦)',
            gaussdb_defKey: '10.GuassDB',
            kingbase_defKey: '11.Kingbase(人大金仓)',
            maxcompute_defKey: '12.MaxCompute',
            sqlite_defKey: '13.SQLite',
            'hive-MySQL_defKey': '14.Hive(MySQL做metastore)',
            'hive-PostgreSQL_defKey': '15.Hive(PostgreSQL做metastore)',
            gbase_defKey: '16.GBase',
            doris_defKey: '17.Doris 配置示例：（请直接参考并使用第1，2两条，MySQL的示例即可）',
        },
        configExample: '配置示例：',
        connectSuccess: '连接成功',
        connectSuccessMessage: '数据库连接设置配置正确',
        connectError: '连接失败',
        emptyConnect: '暂无数据库连接，请点击新增创建',
        validateDb: '连接名不能重复或者为为空',
    },
    dbReverseParse: {
        emptyDbConn: '未检测到数据库连接!请先到"工具栏/数据库"配置好数据库连接',
        next: '下一步',
        pre: '上一步',
        validate: '数据库或者逻辑名格式不能为空',
        dbSelectTitle: '选择数据库',
        dbSelect: '请选择需要解析的数据库',
        nameFormat: '逻辑名格式',
        nameFormatType: {
            UPPERCASE: '全大写',
            LOWCASE: '全小写',
            DEFAULT: '不处理',
        },
        parseDbTitle: '解析数据库',
        parseDb: '正在解析数据库，请稍后。。。（请勿关闭当前弹窗！）',
        parseDbError: '数据库解析失败',
        selectEntity: '选择数据表',
        dealResult: '解析结果：共解析出[{data}]张数据表，当前模型中已经存在的有[{exists}]张表，请勾选需要添加到模型中的数据表！',
    },
    importDb: {
        dealResult: '解析结果：共解析出[{data}]张数据表，当前模型中已经存在的有[{exists}]张表，请勾选需要添加到模型中的数据表！',
    },
    group: {
        base: '基本信息',
        defKey: '主题域代码',
        defName: '主题域名称',
        selectGroup: '选择主题域',
        refEntities: '数据表',
        refViews: '多表透视',
        refDiagrams: '关系图',
        refDicts: '数据字典',
    },
    exportFile: {
        warring: '正在开发中，敬请期待……',
    },
    components: {
        select: {
            empty: '---请选择---',
        },
        multipleselect: {
            empty: '暂无数据',
        },
        codehighlight: {
            loading: '正在生成代码信息。。。',
        },
        modalInput: {
            select: '请选择',
            placeholder: '点击输入框或者图标选择',
        },
        searchSuggest: {
            length: '查找到{count}条数据',
            entities: '数据表（多表透视）定义',
            fields: '数据表（多表透视）字段',
            dicts: '数据字典定义',
            dictItems: '数据字典条目',
            standardFields: '字段库',
            empty: '暂无数据',
            detail: '详情',
            position: '定位',
            more: '全部...',
            moreList: '全部',
        },
        listSelect: {
            tableName: '表名',
            useGroup: '所属主题域',
            batchSelection: '批量选择',
            result: '一共解析到{size}个标准字段，其中{repeat}个已经存在',
            remove: '移除',
            repeatMessage: '选择该数据表将会覆盖系统中原有数据表',
            search: '代码/显示名称',
            empty: '暂无数据，请点击左侧选择',
            disable: '关系图中使用的数据表为必选数据表',
            group: '主题域',
            groupNotAllowEmpty: '主题域不能为空',
            all: '全选',
        },
        colorPicker: {
            recent: '最近使用的颜色',
            reset: '恢复默认',
            picker: '颜色选择',
        },
        compare: {
            db: '数据库元数据提取',
            customer: '自定义元数据提取',
            scanTables: '扫描表清单',
            scanField: '扫描表/字段差异',
            scanTablesFirst: '请先执行“扫描表清单”',
            extractedFirst: '请先执行“提取元数据”',
            wait: '待扫描',
            diff: '不一致',
            same: '一致',
            ddl: '模型相对数据库，增量DDL',
            optOrResult: '结果及操作',
            model: '模型侧',
            dbMeta: '数据库',
            view: '查看',
            fold: '收起',
            diffData: '差异',
            code: '代码',
            name: '显示名称',
            fieldCount: '字段数',
            opt: '操作',
            scan: '扫描',
            mergeToModel: '合并至模型',
            fieldCode: '字段代码',
            type: '数据类型',
            len: '长度',
            scale: '小数位数',
            comment: '说明',
            metaName: '名称',
            metaNamePlaceholder: '请输入元数据名',
            metaType: '类型',
            FILE: '文件',
            URL:'URL',
            takeURL: '提取URL',
            takeURLPlaceholder: '请输入URL',
            takeFILE: '提取文件',
            takeFILEPlaceholder: '请选择需要提取的文件',
            notAllowEmpty: '带*号不能为空',
            notAllowRepeat: '元数据名不能重复',
            editMeta: '编辑元数据',
            addMeta: '新增元数据',
            selectedFirst: '请先点击左侧元数据',
            extractMetadata: '提取元数据',
            customerMetaHelp: 'URL返回数据或者文件数据格式:',
            customerMeta: '自定义元数据',
            invalidMetaData: '无效的元数据',
            addRow: '添加行',
            addRowTips: '添加行后，请鼠标移至表代码对应单元格中做选取表操作',
            scanFieldDiff: '扫描字段差异',
            loadTableList: '加载对比清单',
            saveTableList: '保存对比清单',
            loadConfirmTitle: '加载提示',
            loadConfirmMessage: '您选择的对比清单文件中的数据表[{data}]在当前项目中不存在请问您要忽略这些不存在的表吗？如果您选择是，系统将移除当前项目中不存在的表。如果您选择否，系统将放弃本次操作',
            checkTable: '检查表（可合并）',
            diffTable: '比较表（不可合并）',
            delete: '删除',
            remove: '移除',
            entityPicker: '选取表',
            invalidTableList: '无效的清单文件',
            tableListEmpty: '请先点击【添加行】或【加载对比清单】按钮',
            compareList: '对比清单',
            mergeToLeft: '合并增量至左边',
        },
    },
    projectTemplate: {
        entityInitFields: {
            REVISION: '乐观锁',
            CREATED_BY: '创建人',
            CREATED_TIME: '创建时间',
            UPDATED_BY: '更新人',
            UPDATED_TIME: '更新时间',
        },
    },
    exportSql: {
        entity: '导出数据表/多表透视',
        exportEntityAll: '默认导出所有数据表/多表透视',
        exportDictAll: '默认导出所有数据字典',
        exportType: ['自定义', '全部', '建表/多表透视语句', '建索引语句', '基本代码'],
        currentSelectEntity: '当前已选择数据表/多表透视数量：{count}',
        currentSelectDict: '当前已选择数据字典数量：{count}',
        preview: '预览',
        export: '导出',
        pickEntity: '选择数据表/多表透视',
        pickDict: '选择数据字典',
        exportData: '导出内容',
        exportCustomerData: '自定义导出内容',
        defaultGroup: '默认主题域',
        entityList: '数据表',
        viewList: '多表透视',
        current: '数据库类型：',
    },
    excel: {
        importExcel: '选择EXCEL文件并导入',
        template: 'EXCEL文档模板',
        downloadSimple: '简单模板下载',
        downloadGroup: '主题分组式模板下载',
    },
    word: {
        exportWord: '导出文档',
        template: '文档模板设置',
        download: '下载文档模板',
    },
    toggleCase: {
        entityDefKey: '表名',
        fieldDefKey: '字段名',
        indexDefKey: '索引名',
        typeDefKey: '数据类型',
        dbDDL: '数据库DDL',
        uppercase: '全部大写',
        lowercase: '全部小写',
        none: '默认',
    },
    note: {
        title: '标注以及文字颜色',
        noteColor: '文字颜色',
        note: '标注',
        add: '添加',
        save: '保存',
        placeholder: '请输入标注内容',
        edit: '编辑',
        remove: '移除',
        noteFontColor: '标注文字颜色',
    },
    exportImg: {
        type: '图片类型',
        typeSelect: '选择图片类型',
    },
    operationsHistory: {
        resetTitle: '是否将项目恢复至当前保存节点',
        resetMessage: '恢复操作将会覆盖当前项目且不可撤销，是否继续？',
        reset: '恢复',
        resetSuccess: '恢复成功',
        deleteTitle: '是否将当前保存节点删除？',
        deleteMessage: '删除不可撤销，是否继续？',
        delete: '删除',
        deleteSuccess: '删除成功',
        emptyHistory: '暂无操作历史',
        openWindow: '新窗口打开',
        log: '详细日志',
    },
};
