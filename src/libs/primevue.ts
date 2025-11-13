import AnimateOnScroll from 'primevue/animateonscroll';

import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import FloatLabel from 'primevue/floatlabel';
import IconField from 'primevue/iconfield';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import PanelMenu from 'primevue/panelmenu';
import Password from 'primevue/password';
import ProgressBar from 'primevue/progressbar';
import Ripple from 'primevue/ripple';
import Sidebar from 'primevue/sidebar';
import StyleClass from 'primevue/styleclass';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Tooltip from 'primevue/tooltip';

import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

export function importPrimeVueComponents(app: any) {
  app.use(ToastService);
  app.use(ConfirmationService);

  app.directive('animateonscroll', AnimateOnScroll);
  app.directive('styleclass', StyleClass);
  app.directive('ripple', Ripple);
  app.directive('tooltip', Tooltip);

  app.component('ProgressBar', ProgressBar);
  app.component('Paginator', Paginator);
  app.component('IconField', IconField);
  app.component('Toast', Toast);
  app.component('Button', Button);
  app.component('Dialog', Dialog);
  app.component('Textarea', Textarea);
  app.component('InputText', InputText);
  app.component('FloatLabel', FloatLabel);
  app.component('Password', Password);
  app.component('Sidebar', Sidebar);
  app.component('Avatar', Avatar);
  app.component('AvatarGroup', AvatarGroup);
  app.component('Tag', Tag);
  app.component('Card', Card);
  app.component('DataTable', DataTable);
  app.component('Column', Column);
  app.component('PanelMenu', PanelMenu);
  app.component('ConfirmDialog', ConfirmDialog);
  app.component('Divider', Divider);
}
