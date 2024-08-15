import * as yup from 'yup';
import { ChangeEvent, useCallback } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { CVData, useStore } from './state';

const schema = yup.object().shape({
  name: yup.string().required(),
  address: yup.string().required(),
  phone1: yup.string().required(),
  phone2: yup.string().required(),
  email: yup.string().email().required(),
  statement: yup.string().required(),
  skills: yup.array().of(yup.string()).required(),
  experience: yup.array().of(
    yup.object().shape({
      title: yup.string().required(),
      company: yup.string().required(),
      period: yup.string().required(),
      duties: yup.array().of(yup.string()).required(),
    })
  ),
  interests: yup.array().of(yup.string()).required(),
});

interface SchemaData extends yup.InferType<typeof schema> {}

export const useCVBuilder = () => {
  const {
    cvData,
    isMobile,
    setCvData,
    setIsExportingJSON,
    setIsGeneratingPDF,
    setOpenPdfDialog,
    setPdfBlob,
  } = useStore();

  const updateCvData = useCallback((newData: Partial<CVData>) => {
    setCvData(newData);
  }, []);

  const onDragEnd = (result: DropResult, section: keyof CVData) => {
    if (!result.destination) {
      return;
    }

    if (section.startsWith('experience[')) {
      const matches = section.match(/\d+/g);
      if (!matches) {
        return;
      }
      const expIndex = parseInt(matches[0], 10);
      const items = Array.from(cvData.experience[expIndex].duties);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setCvData((prev) => {
        const newExperience = [...prev.experience];
        newExperience[expIndex] = { ...newExperience[expIndex], duties: items };
        return { ...prev, experience: newExperience };
      });
    } else if (Array.isArray(cvData[section])) {
      const items = Array.from(cvData[section] as string[]);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setCvData((prev) => {
        return { ...prev, [section]: items };
      });
    }
  };

  const addField = useCallback((section: keyof CVData, isNestedArray = false) => {
    setCvData((prev) => {
      if (section === 'experience' && isNestedArray) {
        return {
          ...prev,
          [section]: [...prev[section], { title: '', company: '', period: '', duties: [''] }],
        };
      } else if (Array.isArray(prev[section])) {
        return {
          ...prev,
          [section]: [...(prev[section] as string[]), ''],
        };
      }
      return prev;
    });
  }, []);

  const removeField = useCallback((section: keyof CVData, index: number) => {
    setCvData((prev) => {
      if (Array.isArray(prev[section])) {
        const newArray = [...(prev[section] as any[])];
        newArray.splice(index, 1);
        return { ...prev, [section]: newArray };
      }
      return prev;
    });
  }, []);

  const addDuty = useCallback((expIndex: number) => {
    setCvData((prev) => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].duties.push('');
      return { ...prev, experience: newExperience };
    });
  }, []);

  const removeDuty = useCallback((expIndex: number, dutyIndex: number) => {
    setCvData((prev) => {
      const newExperience = [...prev.experience];
      newExperience[expIndex].duties.splice(dutyIndex, 1);
      return { ...prev, experience: newExperience };
    });
  }, []);

  const handleChange = useCallback(
    (section: keyof CVData, index: number, field: string | null, value: string | string[]) => {
      setCvData((prev) => {
        if (section === 'experience' && field) {
          const newExperience = [...prev.experience];
          newExperience[index] = { ...newExperience[index], [field]: value };
          return { ...prev, experience: newExperience };
        } else if (Array.isArray(prev[section])) {
          const newArray = [...(prev[section] as string[])];
          newArray[index] = value as string;
          return { ...prev, [section]: newArray };
        }
        return prev;
      });
    },
    []
  );

  const handleClosePdfDialog = () => {
    setOpenPdfDialog(false);
    setIsGeneratingPDF(false);
  };

  const handleDownload = (href: string, fileName: string) => {
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Unable to download ${fileName}. Please try again.`);
    }
  };

  const handleMobileDownload = (href: string, fileName: string) => {
    const newWindow = window.open(href, '_blank');

    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      const link = document.createElement('a');
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.href = href;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getResponse = useCallback(
    async (url: string) => {
      try {
        let prefix = window.location.origin;
        const u = new URL(window.location.href);
        if (u.port) {
          prefix = `${u.protocol}//${u.hostname}`;
        }

        return await fetch(`${prefix}${url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cvData),
        });
      } catch (error) {
        console.error('Failed to get response:', error);
        alert('Failed to get response from server. Please try again.');
      }
    },
    [cvData]
  );

  const generatePDF = useCallback(async () => {
    try {
      setIsGeneratingPDF(true);
      const response = await getResponse('/api/generate-pdf');
      if (response && response.ok) {
        const data = await response.json();
        if (isMobile) {
          handleMobileDownload(data.download_link, `${cvData.name.replace(/\s+/g, '_')}_CV.pdf`);
        } else {
          const pdfContent = `data:application/pdf;base64,${data.pdf_preview}`;
          setPdfBlob(pdfContent);
          setOpenPdfDialog(true);
        }
      } else {
        console.error('Failed to generate PDF:', response?.statusText || 'No response');
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [cvData, isMobile, getResponse]);

  const exportJSON = useCallback(async () => {
    try {
      setIsExportingJSON(true);
      const response = await getResponse('/api/export-json');
      if (response && response.ok) {
        const data = await response.json();
        if (isMobile) {
          handleMobileDownload(data.download_link, `${cvData.name.replace(/\s+/g, '_')}_CV_data.json`);
        } else {
          let prefix = window.location.origin;
          const u = new URL(window.location.href);
          if (u.port) {
            prefix = `${u.protocol}//${u.hostname}`;
          }

          handleDownload(
            `${prefix}${data.download_link}`,
            `${cvData.name.replace(/\s+/g, '_')}_CV_data.json`
          );
        }
      } else {
        console.error('Failed to export JSON:', response?.statusText || 'No response');
        alert('Failed to export JSON. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('An error occurred while exporting JSON. Please try again.');
    } finally {
      setIsExportingJSON(false);
    }
  }, [cvData, isMobile, getResponse]);

  const importJSON = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const importedData = JSON.parse(e.target?.result as string) as CVData;
            updateCvData(importedData);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Error importing data. Please make sure the file is a valid JSON.');
          }
        };
        reader.readAsText(file);
      }
    },
    [updateCvData]
  );

  return {
    addDuty,
    addField,
    exportJSON,
    generatePDF,
    handleChange,
    handleClosePdfDialog,
    handleDownload,
    isMobile,
    importJSON,
    onDragEnd,
    removeDuty,
    removeField,
    updateCvData,
  };
};
