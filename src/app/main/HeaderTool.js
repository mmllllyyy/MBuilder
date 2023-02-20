import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {FormatMessage, GroupIcon, Icon, SearchSuggest, Modal} from 'components';
import {validateNeedSave} from '../../lib/datasource_util';
import { checkAlignEnable} from '../../lib/position';

const GroupIconGroup = GroupIcon.GroupIconGroup;

export default React.memo(forwardRef(({currentPrefix, close, iconClick, openModal,
                                        activeTab, dataSource,
                                        jumpPosition, jumpDetail}, ref) => {
  const [isCellSelected, setIsCellSelected] = useState([]);
  const calcIsCellSelected = (isSimple) => {
      if (isSimple) {
          return isCellSelected.length > 0;
      }
      return checkAlignEnable(isCellSelected);
  };
  useImperativeHandle(ref, () => {
    return {
      setIsCellSelected,
    };
  }, []);
  const _close = () => {
    if (validateNeedSave(dataSource)) {
      Modal.confirm({
        title: FormatMessage.string({id: 'closeConfirmTitle'}),
        message: FormatMessage.string({id: 'closeConfirm'}),
        onOk:() => {
          close();
        },
      });
    } else {
      close();
    }
  };
  return <div className={`${currentPrefix}-head`}>
    <div className={`${currentPrefix}-head-logo`}>
      <div className={`${currentPrefix}-head-logo-opt`}>
        <span>
          <Icon type='fa-angle-left' onClick={_close}/>
        </span>
        <span>{dataSource.name}</span>
      </div>
    </div>
    <GroupIconGroup>
      <GroupIcon
        dropType='icon'
        groupKey='save'
        title={FormatMessage.string({id: 'toolbar.save'})}
        icon='fa-floppy-o'
        onClick={iconClick}
        dropMenu={[
            /*{ key: 'save', name: FormatMessage.string({id: 'toolbar.save'})},*/
            { key: 'saveAs', name: FormatMessage.string({id: 'toolbar.saveAs'})},
          ]}/>
      <GroupIcon
        className={`${currentPrefix}-head-db`}
        title={FormatMessage.string({id: 'toolbar.refresh'})}
        onClick={() => iconClick(null, 'refresh')}
        icon='fa-refresh'
      />
      {/* eslint-disable-next-line max-len */}
      {/*<GroupIcon title={FormatMessage.string({id: 'toolbar.opt'})} icon='opt.svg' dropMenu={[]}/>*/}
    </GroupIconGroup>
    <GroupIconGroup>
      <GroupIcon
        draggable
        hoverTitle={activeTab?.type !== 'diagram' ? FormatMessage.string({id: 'toolbar.relationEnableTitle'}) : ''}
        title={FormatMessage.string({id: 'toolbar.emptyEntity'})}
        icon='icon-kongbiao'
        disable={activeTab?.type !== 'diagram'}
        //style={{cursor: 'move'}}
        onClick={iconClick}
        groupKey='empty'
        //onMouseDown={e => iconClick(e, 'empty')}
      />
      <GroupIcon
        draggable
        className={`${currentPrefix}-head-db`}
        hoverTitle={activeTab?.type !== 'diagram' ? FormatMessage.string({id: 'toolbar.relationEnableTitle'}) : ''}
        title={FormatMessage.string({id: 'toolbar.group'})}
        icon='fa-object-group'
        //style={{cursor: 'move'}}
        onClick={iconClick}
        groupKey='group'
        disable={activeTab?.type !== 'diagram'}
        //onMouseDown={e => iconClick(e, 'group')}
      />
      <GroupIcon
        className={`${currentPrefix}-head-db`}
        dropType='all'
        disable={activeTab?.type !== 'diagram'}
        hoverTitle={activeTab?.type !== 'diagram' ? FormatMessage.string({id: 'toolbar.relationEnableTitle'}) : ''}
        groupKey='shape'
        title={FormatMessage.string({id: 'toolbar.shape'})}
        icon='fa-square-o'
        onClick={iconClick}
        dropMenu={[
                {draggable: true, icon: <span className={`${currentPrefix}-head-rect`}/>, key: 'rect', name: FormatMessage.string({id: 'toolbar.rect'})},
                {draggable: true, icon: <span className={`${currentPrefix}-head-round`}/>, key: 'round', name: FormatMessage.string({id: 'toolbar.round'})},
                {draggable: true, icon: <span className={`${currentPrefix}-head-circle`}/>, key: 'circle', name: FormatMessage.string({id: 'toolbar.circle'})},
                {draggable: true, icon: <span className={`${currentPrefix}-head-polygon`}/>,  key: 'polygon', name: FormatMessage.string({id: 'toolbar.polygon'})},
            ]}/>
      <GroupIcon
        hoverTitle={activeTab?.type !== 'diagram' ? FormatMessage.string({id: 'toolbar.relationEnableTitle'}) : ''}
        title={FormatMessage.string({id: 'toolbar.mind'})}
        icon={<div className={`${currentPrefix}-head-mind ${currentPrefix}-head-mind-${activeTab?.type !== 'diagram' ? 'disable' : 'normal'}`} >
          <div className={`${currentPrefix}-head-mind-img`} />
        </div>}
        groupKey='mind'
        onClick={iconClick}
        disable={activeTab?.type !== 'diagram'}
        />
      <GroupIcon
        topStyle={{height: '24px'}}
        dropType='all'
        disable={activeTab?.type !== 'diagram' || !calcIsCellSelected(false)}
        hoverTitle={activeTab?.type !== 'diagram' ? FormatMessage.string({id: 'toolbar.relationEnableTitle'}) : ''}
        groupKey='alignment'
        title={FormatMessage.string({id: 'toolbar.alignment'})}
        icon='fa-align-left'
        onClick={iconClick}
        dropMenu={[
                {icon: <span className={`${currentPrefix}-head-alignLeft`}/>, key: 'alignLeft', name: FormatMessage.string({id: 'toolbar.alignLeft'})},
                {icon: <span className={`${currentPrefix}-head-horizontalCenter`}/>, key: 'horizontalCenter', name: FormatMessage.string({id: 'toolbar.horizontalCenter'})},
                {icon: <span className={`${currentPrefix}-head-alignRight`}/>,  key: 'alignRight', name: FormatMessage.string({id: 'toolbar.alignRight'})},
                {icon: <span className={`${currentPrefix}-head-alignTop`}/>, key: 'alignTop', name: FormatMessage.string({id: 'toolbar.alignTop'})},
                {icon: <span className={`${currentPrefix}-head-verticalCenter`}/>, key: 'verticalCenter', name: FormatMessage.string({id: 'toolbar.verticalCenter'})},
                {icon: <span className={`${currentPrefix}-head-alignBottom`}/>, key: 'alignBottom', name: FormatMessage.string({id: 'toolbar.alignBottom'})},
                {icon: <span className={`${currentPrefix}-head-alignRow`}/>, key: 'alignRow', style: {borderTop: '1px solid #DFE3EB'}, name: FormatMessage.string({id: 'toolbar.alignRow'})},
                {icon: <span className={`${currentPrefix}-head-alignColumn`}/>, key: 'alignColumn', name: FormatMessage.string({id: 'toolbar.alignColumn'})},
            ]}/>
      <GroupIcon
        topStyle={{height: '24px'}}
        dropType='all'
        groupKey='tool'
        title={FormatMessage.string({id: 'toolbar.tool'})}
        icon='fa-briefcase'
        onClick={iconClick}
        dropMenu={[
                {key: 'toggleCase', name: FormatMessage.string({id: 'toolbar.toggleCase'})},
            ]}/>
    </GroupIconGroup>
    <GroupIconGroup>
      <GroupIcon
        title={FormatMessage.string({id: 'toolbar.import'})}
        onClick={iconClick}
        icon={<Icon type='icon-daoru'/>}
        dropMenu={[
            { key: 'pdman', name: FormatMessage.string({id: 'toolbar.importPDMan'}) },
            { key: 'chiner', name: FormatMessage.string({id: 'toolbar.importCHNR'}) },
            { key: 'PDManer', name: FormatMessage.string({id: 'toolbar.importPDManer'}) },
            { key: 'powerdesigner', name: FormatMessage.string({id: 'toolbar.importPowerDesigner'}) },
            { key: 'db', name: FormatMessage.string({id: 'toolbar.importDb'}) },
            { key: 'excel', name: FormatMessage.string({id: 'toolbar.importExcel'}) },
            { key: 'importDDL', name: FormatMessage.string({id: 'toolbar.importDDL'}) },
            { style: { borderTop: '1px solid #DFE3EB' },
              key: 'domains',
              name: FormatMessage.string({id: 'toolbar.importDomains'}),
            },
            {
                key: 'appCodes',
                name: FormatMessage.string({id: 'toolbar.importAppCodes'}),
            },
            { key: 'importConfig', name: FormatMessage.string({id: 'toolbar.importConfig'}) },
            { key: 'importDicts', name: FormatMessage.string({id: 'toolbar.importDicts'}) },
        ]}
      />
      <GroupIcon
        onClick={iconClick}
        title={FormatMessage.string({id: 'toolbar.export'})}
        icon={<Icon type='icon-daochu'/>}
        dropMenu={[
            {key: 'word', name: FormatMessage.string({id: 'toolbar.exportWord'})},
            {key: 'html', name: FormatMessage.string({id: 'toolbar.exportHtml'})},
            // {key: 'markdown', name: FormatMessage.string({id: 'toolbar.exportMarkdown'})},
            {key: 'sql', name: FormatMessage.string({id: 'toolbar.exportSql'})},
            {key: 'dict', name: FormatMessage.string({id: 'toolbar.exportDict'})},
            {
              key: 'img',
              name: FormatMessage.string({id: 'toolbar.exportImg'}),
              disable: activeTab?.type !== 'diagram',
            },
            {
              style: { borderTop: '1px solid #DFE3EB' },
              key: 'exportDomains',
              name: FormatMessage.string({id: 'toolbar.exportDomains'}),
            },
            {
                key: 'exportAppCodes',
                name: FormatMessage.string({id: 'toolbar.exportAppCodes'}),
            },
            { key: 'exportConfig', name: FormatMessage.string({id: 'toolbar.exportConfig'}) },
            { key: 'exportDicts', name: FormatMessage.string({id: 'toolbar.exportDicts'}) },
          ]}
      />
      <GroupIcon title={FormatMessage.string({id: 'toolbar.setting'})} icon='icon-shezhi' onClick={() => openModal('config')}/>
      <GroupIcon className={`${currentPrefix}-head-db`} title={FormatMessage.string({id: 'toolbar.dbConnect'})} icon='fa-database' onClick={() => openModal('dbConnect')}/>
    </GroupIconGroup>
    <div className={`${currentPrefix}-head-search`}>
      <SearchSuggest
        jumpPosition={jumpPosition}
        jumpDetail={jumpDetail}
        placeholder={FormatMessage.string({id: 'toolbar.search'})}
        dataSource={dataSource}
      />
    </div>
  </div>;
}));
