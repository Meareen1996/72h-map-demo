import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadGeofences } from '@store/modules/geofenceSlice';

const useGeofences = () => {
    const dispatch = useDispatch();
    const { geofences, status } = useSelector(state => state.geofences);

    useEffect(() => {
        // Load geofences from IndexedDB when status is 'idle'
        if (status === 'idle') {
            dispatch(loadGeofences());
        }
    }, [dispatch, status]);

    return { geofences };
}

export default useGeofences;