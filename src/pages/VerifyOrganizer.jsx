import { collection, doc, deleteDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function VerifyOrganizer() {

    const [organizers, setOrganizers] = useState([]);


    useEffect(() => {
        const fetchOrganizers = async () => {
            
        };
    
        fetchUniversities();
      }, []);
}