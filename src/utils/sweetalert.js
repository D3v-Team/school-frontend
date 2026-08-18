import Swal from "sweetalert2";

export const sweetAlert = (message, iconType) => {
  Swal.fire({
    title: message,
    icon: iconType,
    position: "top-end",
    timer: 3000,
    timerProgressBar: true,
    showCloseButton: true,
    toast: true,
    showConfirmButton: false,
  });
};

export const commonAlert = ( message, iconType ) => {
  Swal.fire({
    title: message,
    icon: iconType,
    draggable: true
  });  
}
