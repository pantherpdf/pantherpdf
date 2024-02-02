/**
 * @file Visualize sourceData
 * @project PantherPDF Report Editor
 * @copyright Ignac Banic 2021-2023
 * @license MIT
 */

import React, { Component } from 'react';
import trans from '../translation';
import { getAllPublicObjectKeys } from '../formula/isPropertyAllowed';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

const MyRow = styled('div')({
  display: 'flex',
  minWidth: '10rem',
});
const BtnCont = styled('div')({
  width: '1.6rem',
});
const MyChild = styled('div')({
  paddingLeft: '0.9rem',
});
const MyPre = styled('pre')({
  margin: '0',
});
const MyIcon = styled('div')({
  width: '1.4rem',
});

interface Props {
  data: unknown;
}

interface State {
  data: unknown;
  expanded: { [key: string]: boolean };
  promiseResolved: boolean | { [key: string]: unknown };
  promiseResult: unknown;
  funcResolved: { [key: string]: boolean };
  funcResult: { [key: string]: unknown };
}

export default class ObjectExplorer extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = ObjectExplorer.reset(props.data);
  }

  static reset(data: unknown): State {
    return {
      data: data,
      expanded: {},
      promiseResolved: false,
      promiseResult: null,
      funcResolved: {},
      funcResult: {},
    };
  }

  static getDerivedStateFromProps(props: Props, prevState: State) {
    if (props.data !== prevState.data) {
      const state = ObjectExplorer.reset(props.data);
      return state;
    }
    return null;
  }

  componentDidMount() {
    if (
      this.state.data &&
      typeof this.state.data === 'object' &&
      Promise.resolve(this.state.data) === this.state.data
    ) {
      (this.state.data as Promise<unknown>).then(dt =>
        this.setState({ promiseResolved: true, promiseResult: dt }),
      );
    }
  }

  isExpanded(key: string) {
    return this.state.expanded[key];
  }

  renderIcon(key: string, dt: unknown) {
    if (
      typeof this.state.promiseResolved === 'object' &&
      this.state.promiseResolved &&
      key in this.state.promiseResolved
    ) {
      return <span style={{ fontSize: '50%' }}>prms</span>;
    }
    if (dt === null || dt === undefined) {
      return <span style={{ fontSize: '50%' }}>nul</span>;
    }
    if (dt === false || dt === true) {
      return <span style={{ fontSize: '50%' }}>bool</span>;
    }
    if (typeof dt === 'number') {
      return '#';
    }
    if (typeof dt === 'function') {
      return '𝑓';
    } // ⨍𝑓
    if (typeof dt === 'string') {
      return <span style={{ fontSize: '70%' }}>txt</span>;
    }

    if (Array.isArray(dt)) {
      return '[]';
    }

    return '{}';
  }

  renderItemExpand(name: string, key: string, dt: unknown) {
    const canExpand =
      !!dt && (typeof dt === 'object' || typeof dt === 'function');
    return (
      <React.Fragment key={key}>
        <MyRow>
          <BtnCont>
            {canExpand && (
              <IconButton
                size="small"
                onClick={e => {
                  e.preventDefault();
                  if (this.isExpanded(key)) {
                    this.collapse(key);
                  } else {
                    this.expand(key, dt);
                  }
                }}
              >
                <FontAwesomeIcon
                  icon={this.isExpanded(key) ? faMinus : faPlus}
                  size="xs"
                  fixedWidth
                />
              </IconButton>
            )}
          </BtnCont>
          <MyIcon>
            <Typography color="GrayText">{this.renderIcon(key, dt)}</Typography>
          </MyIcon>
          <div
            style={{ flex: '1' }}
            onClick={e => {
              e.preventDefault();
              if (this.state.expanded[key]) {
                this.collapse(key);
              } else {
                this.expand(key, dt);
              }
            }}
          >
            {name}
          </div>
          {!canExpand && <ObjectExplorer data={dt} />}
        </MyRow>
        {canExpand && this.isExpanded(key) && (
          <MyChild>
            <ObjectExplorer
              data={typeof dt === 'function' ? this.state.funcResult[key] : dt}
            />
          </MyChild>
        )}
      </React.Fragment>
    );
  }

  change_funcResult(key: string, value: unknown) {
    this.setState(prevState => {
      const fr = { ...prevState.funcResult };
      fr[key] = value;
      return { funcResult: fr };
    });
  }

  change_funcResolved(key: string, value: boolean) {
    this.setState(prevState => {
      const fr = { ...prevState.funcResolved };
      fr[key] = value;
      return { funcResolved: fr };
    });
  }

  change_expanded(key: string, value: boolean) {
    this.setState(prevState => {
      const fr = { ...prevState.expanded };
      fr[key] = value;
      return { expanded: fr };
    });
  }

  expand(key: string, dt: unknown) {
    if (dt && typeof dt === 'function' && !this.state.funcResolved[key]) {
      this.change_funcResult(key, dt());
      this.change_funcResolved(key, true);
    }
    this.change_expanded(key, true);
  }

  collapse(key: string) {
    this.change_expanded(key, false);
  }

  renderArray() {
    const data = this.state.data as unknown[];
    if (data.length === 0) {
      return (
        <div>
          <div>{'['}</div>
          <Typography color="GrayText">
            <small>{trans('empty')}</small>
          </Typography>
          <div>{']'}</div>
        </div>
      );
    }
    return data.map((dt, idx) =>
      this.renderItemExpand('[' + idx + ']', String(idx), dt),
    );
  }

  renderObject() {
    const data = this.state.data as { [key: string]: unknown };
    if (Object.keys(data).length === 0) {
      return (
        <div>
          <div>{'{'}</div>
          <Typography color="GrayText">
            <small>{trans('empty')}</small>
          </Typography>
          <div>{'}'}</div>
        </div>
      );
    }
    return getAllPublicObjectKeys(data).map(key => {
      let value = data[key];
      if (typeof value === 'function') {
        value = value.bind(data);
      }
      return this.renderItemExpand(key, key, value);
    });
  }

  renderPromise() {
    if (this.state.promiseResolved) {
      return <ObjectExplorer data={this.state.promiseResult} />;
    }
    return <i>loading ...</i>;
  }

  renderFunction() {
    return null;
  }

  renderOther() {
    return <MyPre>{JSON.stringify(this.state.data)}</MyPre>;
  }

  render() {
    if (this.state.data && Array.isArray(this.state.data)) {
      return this.renderArray();
    }
    if (this.state.data && typeof this.state.data === 'object') {
      if (Promise.resolve(this.state.data) === this.state.data) {
        return this.renderPromise();
      }
      return this.renderObject();
    }
    if (this.state.data && typeof this.state.data === 'function') {
      return this.renderFunction();
    }
    return this.renderOther();
  }
}
