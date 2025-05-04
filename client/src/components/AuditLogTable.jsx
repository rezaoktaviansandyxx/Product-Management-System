import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AppConfig from '../config/AppConfig';
import { format } from 'date-fns';
import CapitalizeFirstLetter from './CapitalizeFirstLetter';

const AuditLogTable = ({tableName}) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [logsPerPage] = useState(8);
    const [sortConfig, setSortConfig] = useState({
        key: 'created_at',
        direction: 'desc'
    });

    useEffect(() => {
        let url = `${AppConfig.API_URL}/audit-logs`;
        if (tableName) {
            url += `?table_name=${tableName}`;
        }
        axios.get(url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                setLogs(response.data.data);
            })
            .catch(error => {
                console.error('Failed to fetch audit logs:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [tableName]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedLogs = () => {
        const sortableLogs = [...logs];
        if (sortConfig.key) {
            sortableLogs.sort((a, b) => {
                // Handle nested objects (like user.username)
                let aValue, bValue;

                if (sortConfig.key === 'username') {
                    aValue = a.user?.username || '';
                    bValue = b.user?.username || '';
                } else {
                    aValue = a[sortConfig.key] || '';
                    bValue = b[sortConfig.key] || '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableLogs;
    };

    const sortedLogs = getSortedLogs();

    if (loading) return <div>Loading...</div>;

    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = sortedLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(sortedLogs.length / logsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };

    return (
        <div className="h-100">
            <div className="card h-100">
                <div className="card-body" style={{ overflow: 'auto' }}>
                    <h2 className="card-title mb-4">History</h2>
                    <div style={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th
                                        scope="col"
                                        onClick={() => requestSort('created_at')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Date{getSortIndicator('created_at')}
                                    </th>
                                    <th
                                        scope="col"
                                        onClick={() => requestSort('event')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Action{getSortIndicator('event')}
                                    </th>
                                    <th
                                        scope="col"
                                        onClick={() => requestSort('username')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        User{getSortIndicator('username')}
                                    </th>
                                    <th scope="col">Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td>{format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}</td>
                                        <td><CapitalizeFirstLetter text={log.event} /></td>
                                        <td>{log.user?.username.toUpperCase() || 'N/A'}</td>
                                        <td><CapitalizeFirstLetter text={log.event} /> {log.table_name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="d-flex justify-content-center mt-4">
                            <ul className="pagination">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                                        Previous
                                    </button>
                                </li>
                                {[...Array(totalPages)].map((_, index) => (
                                    <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => paginate(index + 1)}>
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogTable;