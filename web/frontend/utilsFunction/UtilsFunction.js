import Swal from 'sweetalert2';

    const isConfirmedFun=(title, text, icon, showCancelButton, confirmButtonColor,cancelButtonColor, confirmButtonText,  callback , id)=> {
        Swal.fire({
          title: title,
          text: text,
          icon: icon,
          showCancelButton: showCancelButton,
          confirmButtonColor: confirmButtonColor,
          cancelButtonColor: cancelButtonColor,
          confirmButtonText: confirmButtonText
         }).then((result) => {
          if (result.isConfirmed) {
                callback(id);
             }
        });
       }
export {isConfirmedFun}