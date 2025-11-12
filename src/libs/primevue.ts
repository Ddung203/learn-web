import AnimateOnScroll from 'primevue/animateonscroll';

import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import FloatLabel from 'primevue/floatlabel';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Paginator from 'primevue/paginator';
import Password from 'primevue/password';
import ProgressBar from 'primevue/progressbar';
import Ripple from 'primevue/ripple';
import Sidebar from 'primevue/sidebar';
import StyleClass from 'primevue/styleclass';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import PanelMenu from 'primevue/panelmenu';
import FileUpload from 'primevue/fileupload';
import InputOtp from 'primevue/inputotp';
import Slider from 'primevue/slider';
import Tooltip from 'primevue/tooltip';
import ConfirmDialog from 'primevue/confirmdialog';
import InputNumber from 'primevue/inputnumber';
import RadioButton from 'primevue/radiobutton';
import Image from 'primevue/image';

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
  app.component('InputIcon', InputIcon);
  app.component('Toast', Toast);
  app.component('Button', Button);
  app.component('Dialog', Dialog);
  app.component('Textarea', Textarea);
  app.component('Dropdown', Dropdown);
  app.component('InputText', InputText);
  app.component('FloatLabel', FloatLabel);
  app.component('Password', Password);
  app.component('Sidebar', Sidebar);
  app.component('Avatar', Avatar);
  app.component('AvatarGroup', AvatarGroup);
  app.component('Tag', Tag);
  app.component('Toolbar', Toolbar);
  app.component('Card', Card);
  app.component('DataTable', DataTable);
  app.component('Column', Column);
  app.component('PanelMenu', PanelMenu);
  app.component('FileUpload', FileUpload);
  app.component('InputOtp', InputOtp);
  app.component('Slider', Slider);
  app.component('ConfirmDialog', ConfirmDialog);
  app.component('InputNumber', InputNumber);
  app.component('RadioButton', RadioButton);
  app.component('Image', Image);
}
