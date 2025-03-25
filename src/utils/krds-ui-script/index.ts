import { krds_modal } from './krds_modal'
import { krds_fileUpload } from './krds_fileUpload'
import { krds_chkBox } from './krds_chkBox'
import { krds_tab } from './krds_tab'
import { krds_accordion } from './krds_accordion'
import { krds_contextualHelp } from './krds_contextualHelp'
import { krds_tooltip } from './krds_tooltip'
import { krds_inPageNavigation } from './krds_inPageNavigation'
import { krds_helpPanel } from './krds_helpPanel'
import { krds_disclosure } from './krds_disclosure'
import { krds_dropEvent } from './krds_dropEvent'
import { krds_toggleSwitch } from './krds_toggleSwitch'
import { krds_infoList } from './krds_infoList'
import { krds_calendar } from './krds_calendar'
import { krds_sideNavigation } from './krds_sideNavigation'
import { krds_mainMenuPC } from './krds_mainMenuPC'
import { krds_mainMenuMobile } from './krds_mainMenuMobile'

export function initAllKRDS(): void {
  krds_modal.init()
  krds_fileUpload.init()
  krds_chkBox.init()
  krds_tab.init()
  krds_accordion.init()
  krds_contextualHelp.init()
  krds_tooltip.init()
  krds_inPageNavigation.init()
  krds_helpPanel.init()
  krds_disclosure.init()
  krds_dropEvent.init()
  krds_toggleSwitch.init()
  krds_infoList.init()
  krds_calendar.init()
  krds_sideNavigation.init()
  krds_mainMenuPC.init()
  krds_mainMenuMobile.init()
}
