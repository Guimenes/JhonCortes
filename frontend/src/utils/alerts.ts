import Swal from 'sweetalert2';
import type { SweetAlertIcon, SweetAlertPosition } from 'sweetalert2';

// Configuração padrão do SweetAlert2
const defaultConfig = {
  confirmButtonColor: '#FFD700', // var(--primary-yellow)
  cancelButtonColor: '#6b7280',
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  showClass: {
    popup: 'animate__animated animate__fadeInDown animate__faster'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutUp animate__faster'
  }
};

// Alert de sucesso
export const showSuccess = (
  title: string, 
  message?: string, 
  timer: number = 3000
) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'success',
    title,
    text: message,
    timer,
    showConfirmButton: false,
    toast: true,
    position: 'top-end' as SweetAlertPosition,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};

// Alert de erro
export const showError = (
  title: string, 
  message?: string, 
  showConfirmButton: boolean = true
) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'error' as SweetAlertIcon,
    title,
    text: message,
    showConfirmButton,
    timer: showConfirmButton ? undefined : 5000,
    toast: !showConfirmButton,
    position: !showConfirmButton ? 'top-end' as SweetAlertPosition : 'center' as SweetAlertPosition,
    timerProgressBar: !showConfirmButton,
  });
};

// Alert de aviso
export const showWarning = (
  title: string, 
  message?: string, 
  showConfirmButton: boolean = true
) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'warning' as SweetAlertIcon,
    title,
    text: message,
    showConfirmButton,
    timer: showConfirmButton ? undefined : 4000,
    toast: !showConfirmButton,
    position: !showConfirmButton ? 'top-end' as SweetAlertPosition : 'center' as SweetAlertPosition,
    timerProgressBar: !showConfirmButton,
  });
};

// Alert de informação
export const showInfo = (
  title: string, 
  message?: string, 
  timer: number = 4000
) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'info' as SweetAlertIcon,
    title,
    text: message,
    timer,
    showConfirmButton: false,
    toast: true,
    position: 'top-end' as SweetAlertPosition,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};

// Confirmação de ação
export const showConfirmation = (
  title: string,
  message: string,
  confirmText: string = 'Sim, confirmar!',
  cancelText: string = 'Cancelar',
  icon: SweetAlertIcon = 'question'
) => {
  return Swal.fire({
    ...defaultConfig,
    icon,
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true
  });
};

// Confirmação de exclusão
export const showDeleteConfirmation = (
  itemName: string = 'este item',
  customMessage?: string
) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'warning' as SweetAlertIcon,
    title: 'Confirmar Exclusão',
    html: customMessage || `Tem certeza que deseja excluir <strong>${itemName}</strong>?<br><small class="text-muted">Esta ação não pode ser desfeita.</small>`,
    showCancelButton: true,
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    reverseButtons: true,
    focusCancel: true
  });
};

// Confirmação de exclusão permanente
export const showPermanentDeleteConfirmation = (
  itemName: string = 'este item',
  customMessage?: string
) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'error' as SweetAlertIcon,
    title: '⚠️ EXCLUSÃO PERMANENTE',
    html: customMessage || `
      <div style="text-align: left; color: #dc2626;">
        <p><strong>ATENÇÃO:</strong> Você está prestes a excluir permanentemente <strong>"${itemName}"</strong>.</p>
        <p style="margin-top: 15px;"><strong>Esta ação:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>❌ <strong>NÃO PODE ser desfeita</strong></li>
          <li>🗑️ Removerá completamente do banco de dados</li>
          <li>📊 Pode afetar relatórios e históricos</li>
        </ul>
        <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
          💡 <em>Recomendamos desativar ao invés de excluir permanentemente.</em>
        </p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '🗑️ Excluir Permanentemente',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626',
    reverseButtons: true,
    focusCancel: true,
    width: '500px',
    showClass: {
      popup: 'animate__animated animate__pulse'
    }
  });
};

// Loading alert
export const showLoading = (title: string = 'Carregando...', message?: string) => {
  return Swal.fire({
    title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Fechar loading
export const closeLoading = () => {
  Swal.close();
};

// Alert customizado para formulários
export const showFormError = (errors: string[] | string) => {
  const errorList = Array.isArray(errors) 
    ? errors.map(error => `• ${error}`).join('<br>')
    : errors;

  return Swal.fire({
    ...defaultConfig,
    icon: 'error' as SweetAlertIcon,
    title: 'Erro no Formulário',
    html: `<div style="text-align: left;">${errorList}</div>`,
    confirmButtonText: 'Entendi'
  });
};

// Alert de operação bem-sucedida com redirecionamento
export const showSuccessWithRedirect = (
  title: string,
  message: string,
  redirectFn: () => void,
  timer: number = 2000
) => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'success' as SweetAlertIcon,
    title,
    text: message,
    timer,
    showConfirmButton: false,
    willClose: redirectFn
  });
};

// Alert personalizado para autenticação
export const showAuthError = (message: string = 'Erro de autenticação') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'error' as SweetAlertIcon,
    title: 'Acesso Negado',
    text: message,
    confirmButtonText: 'Fazer Login',
    showCancelButton: true,
    cancelButtonText: 'Cancelar'
  });
};

// Alert para uploads
export const showUploadProgress = (title: string = 'Enviando arquivo...') => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    html: `
      <div style="margin: 20px 0;">
        <div style="width: 100%; background-color: #e5e7eb; border-radius: 10px; overflow: hidden;">
          <div id="upload-progress" style="width: 0%; height: 20px; background: linear-gradient(90deg, #FFD700, #B8860B); transition: width 0.3s ease;"></div>
        </div>
        <p style="margin-top: 10px; color: #6b7280; font-size: 14px;">0%</p>
      </div>
    `,
    didOpen: () => {
      // Função para atualizar o progresso (será exportada separadamente)
      (window as any).updateUploadProgress = (percentage: number) => {
        const progressBar = document.getElementById('upload-progress');
        const progressText = progressBar?.parentElement?.nextElementSibling;
        if (progressBar) {
          progressBar.style.width = `${percentage}%`;
        }
        if (progressText) {
          progressText.textContent = `${percentage}%`;
        }
      };
    }
  });
};

// Função para atualizar progresso de upload
export const updateUploadProgress = (percentage: number) => {
  if ((window as any).updateUploadProgress) {
    (window as any).updateUploadProgress(percentage);
  }
};

// Alert toast simples
export const showToast = (
  message: string, 
  icon: SweetAlertIcon = 'info', 
  timer: number = 3000
) => {
  return Swal.fire({
    toast: true,
    position: 'top-end' as SweetAlertPosition,
    icon,
    title: message,
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};
