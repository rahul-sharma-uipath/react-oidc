import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { withRouter, CreateEvent, WindowInternal } from './withRouter';

describe('WithRouter test Suite', () => {
  const generateKeyMock = () => '123ABC';
  const getBaseRouteMock = () => '/base';

  const paramsMock = { bubbles: false, cancelable: false, detail: 'detail' };
  beforeEach(() => {});
  it('should CreateEvent return correct Event if not on IE', () => {
    const windowMock = {
      CustomEvent: jest.fn().mockImplementation((event, params) => {
        return { event, params };
      }),
    };
    const documentMock = {} as Document;
    const res = CreateEvent((windowMock as unknown) as WindowInternal, documentMock)(
      'event test',
      paramsMock
    );
    expect(res).toEqual({
      event: 'event test',
      params: { bubbles: false, cancelable: false, detail: 'detail' },
    });
  });

  it('should createEvent create a polyfill when the default func is undefined', () => {
    const windowMock = {
      Event: {
        prototype: 'protoMock',
      },
    };
    const evtMock = {
      initCustomEvent: jest.fn(),
    };
    const documentMock = {
      createEvent: jest.fn(() => evtMock),
    };
    const typedDocumentMock = (documentMock as unknown) as Document;
    const res = CreateEvent((windowMock as unknown) as WindowInternal, typedDocumentMock)(
      'event test',
      paramsMock
    );
    expect(res).toEqual({ ...evtMock });
    expect(documentMock.createEvent).toHaveBeenCalledWith('CustomEvent');
    expect(evtMock.initCustomEvent).toHaveBeenCalledWith('event test', false, false, 'detail');
  });

  it('should withRouter add location and history', () => {
    const Component = (props: any) => {
      const { history } = props;
      const { push } = history;
      push('/url/page');
      return <div {...props}>Component Mock</div>;
    };
    const windowMock = {
      history: {
        pushState: jest.fn(),
        state: 'state',
      },
      dispatchEvent: jest.fn(),
      location: 'location',
    };
    const createEvent = jest.fn();
    const NewComp = withRouter(
      (windowMock as unknown) as WindowInternal,
      createEvent,
      generateKeyMock,
      getBaseRouteMock
    )(Component);
    const { asFragment } = render(<NewComp />);
    expect(windowMock.history.pushState).toHaveBeenCalledWith(
      { key: '123ABC', state: 'state' },
      null,
      '/base/url/page'
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
