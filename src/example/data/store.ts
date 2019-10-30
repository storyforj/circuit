import createStore from 'redux-zero';
import { CodeTemplate } from '../../CodeTemplate';

export interface IAppState {
  codeTemplates: Array<CodeTemplate>,
}

export const store = createStore({
  codeTemplates: [],
} as IAppState);
