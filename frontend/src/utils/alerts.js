import Swal from 'sweetalert2';

export const toast = (title, icon = 'success') => {
    Swal.fire({
        title: title,
        icon: icon,
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#4f46e5',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });
};

export const modal = (title, text, icon = 'info') => {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'OK',
    });
};

export const askName = async (title = 'Nom du perdant') => {
    const { value: loserName } = await Swal.fire({
        title: title,
        input: 'text',
        inputLabel: 'Nom du joueur',
        inputPlaceholder: 'Entrez le nom...',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#4f46e5',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Annuler',
        inputValidator: (value) => {
            if (!value) {
                return 'Le nom est requis!';
            }
        }
    });
    return loserName;
};
