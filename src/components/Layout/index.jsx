import {Sidebar} from './Sidebar'
import {Content} from './Content'
import {UpdateBanner} from "../UpdateBanner";

import "./Layout.scss"

export const Layout = ({ children }) => {
    return (
        <div className="layout">
            <UpdateBanner />
            <Sidebar className="layout__sidebar" />
            <Content className="layout__content">{children}</Content>
        </div>
    )
}