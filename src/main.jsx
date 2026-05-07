import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {HashRouter} from "react-router"
import {Provider} from "react-redux"
import './index.css'
import App from './App.jsx'
import store from "./store";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <HashRouter>
          <Provider store={store}>
              <App />
          </Provider>
      </HashRouter>
  </StrictMode>,
)
