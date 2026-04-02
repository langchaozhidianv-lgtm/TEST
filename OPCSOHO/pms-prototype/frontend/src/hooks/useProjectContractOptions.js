import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProjects } from "../api/projectAPI";
import { fetchContracts } from "../api/contractAPI";

export default function useProjectContractOptions() {
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [projectRows, contractRows] = await Promise.all([
          fetchProjects(),
          fetchContracts()
        ]);
        setProjects(projectRows);
        setContracts(contractRows);
      } catch (error) {
        setProjects([]);
        setContracts([]);
      }
    };

    loadOptions();
  }, []);

  const projectOptions = useMemo(
    () =>
      projects.map((item) => ({
        value: String(item.id),
        label: `${item.name} (${item.project_code})`
      })),
    [projects]
  );

  const getContractsByProject = useCallback(
    (projectId) => contracts.filter((item) => String(item.project_id) === String(projectId)),
    [contracts]
  );

  const getProjectLabel = useCallback(
    (projectId) => projectOptions.find((item) => item.value === String(projectId))?.label || "",
    [projectOptions]
  );

  return {
    projects,
    contracts,
    projectOptions,
    getContractsByProject,
    getProjectLabel
  };
}
