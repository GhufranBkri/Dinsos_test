// src/pages/TambahData.jsx
// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Number.css";

const TambahData = () => {
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    foto: null,
    bidang: "",
    eselon: "",
    sub_bidang: "",
    jabatan_terakhir: "",
    gol_ruang: "",
    jenjang: "",
    jenis: "",
    jenis_kelamin: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    nik: "",
    npwp: "",
    no_rekening: "",
    no_kk: "",
    golongan_darah: "",
    no_telepon: "",
    email: "",
    email_gov: "",
    pendidikan: "",
    jurusan: "",
    tahun_tamat: "",
    kabupaten: "",
    kecamatan: "",
    desa: "",
    jalan: "",
    alamat_lengkap: "",
    tahun_sk_awal: "",
    tahun_sk_akhir: "",
    masa_kerja: "",
    Kelas_jabatan: "",
    jenis_tekon: "",
    no_req_bkn: "",
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const inputRefs = useRef({});
  const [showModal, setShowModal] = useState(false);

  const jenisKelaminOptions = ["Laki-laki", "Perempuan"];
  const golonganDarahOptions = ["A", "B", "AB", "O"];
  const jenisOptions = ["PNS", "Tenaga Kontrak", "PPPK"];
  const kelasJabatanOptions = ["I", "II", "III", "IV"];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let newErrors = { ...errors };

    if (type === "file") {
      if (files[0]) {
        const file = files[0];
        const allowedTypes = ["image/png", "image/jpeg"];
        if (!allowedTypes.includes(file.type)) {
          newErrors[name] =
            "Invalid file type. Only PNG, JPG, and JPEG are allowed.";
          setFormData({ ...formData, [name]: null });
          setFotoPreview(null);
        } else {
          setFormData({ ...formData, [name]: file });
          setFotoPreview(URL.createObjectURL(file));
          delete newErrors[name];
        }
      } else {
        setFormData({ ...formData, [name]: null });
        setFotoPreview(null);
        newErrors[name] = "This field is required";
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Real-time validation
    if (name === "email" || name === "email_gov") {
      if (!validateEmail(value)) {
        newErrors[name] = "Invalid email format";
      } else {
        delete newErrors[name];
      }
    } else if (
      ["tahun_tamat", "tahun_sk_awal", "tahun_sk_akhir"].includes(name)
    ) {
      if (!validateYear(value)) {
        newErrors[name] = "Must be a 4-digit year";
      } else {
        delete newErrors[name];
      }
    } else if (value === "" || (name === "foto" && !files.length)) {
      newErrors[name] = "This field is required";
    } else {
      delete newErrors[name];
    }

    setErrors(newErrors);

    // Scroll to the first error if any
    const firstErrorElement = Object.keys(newErrors)[0];
    if (firstErrorElement) {
      inputRefs.current[firstErrorElement]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateYear = (year) => {
    const yearRegex = /^\d{4}$/;
    return yearRegex.test(year);
  };

  const validateForm = () => {
    const newErrors = {};
    let firstErrorElement = null;

    Object.keys(formData).forEach((key) => {
      if (formData[key] === "" || (key === "foto" && !formData[key])) {
        newErrors[key] = "This field is required";
        if (!firstErrorElement) {
          firstErrorElement = inputRefs.current[key];
        }
      } else if (key === "email" || key === "email_gov") {
        if (!validateEmail(formData[key])) {
          newErrors[key] = "Invalid email format";
          if (!firstErrorElement) {
            firstErrorElement = inputRefs.current[key];
          }
        }
      } else if (
        ["tahun_tamat", "tahun_sk_awal", "tahun_sk_akhir"].includes(key)
      ) {
        if (!validateYear(formData[key])) {
          newErrors[key] = "Must be a 4-digit year";
          if (!firstErrorElement) {
            firstErrorElement = inputRefs.current[key];
          }
        }
      }
    });

    setErrors(newErrors);

    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found");
      }

      let fotoURL = "";
      if (formData.foto instanceof File) {
        const fotoData = new FormData();
        fotoData.append("image", formData.foto);

        try {
          const fotoResponse = await axios.post(
            "http://localhost:3000/employees/upload-foto",
            fotoData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          // Extract the image URL from the response data
          fotoURL = fotoResponse.data.data.imageUrl;
        } catch (error) {
          console.error("Photo upload failed:", error);
          console.log("Photo Data:", fotoData);
          console.log("Request Headers:", error.config.headers);

          return; // Stop further execution if photo upload fails
        }
      }

      const data = { ...formData, foto: fotoURL };

      await axios.post("http://localhost:3000/employees/", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      alert("Data berhasil ditambahkan");
      window.location.href = "/DataKaryawan";
    } catch (error) {
      if (
        error.response &&
        error.response.data.message.includes("duplicate key error")
      ) {
        alert(
          "An employee with this NIP already exists. Please use a different NIP."
        );
      } else {
        console.error(
          "Error adding data: ",
          error.response ? error.response.data : error.message
        );
        alert(
          `Failed to add data: ${
            error.response ? error.response.data.message : error.message
          }`
        );
      }
    }
  };

  const handleSubmitWithConfirmation = async (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmModal = (e) => {
    e.preventDefault();
    setShowModal(false);
    handleSubmit();
  };

  const handleCancelModal = () => {
    setShowModal(false);
  };

  const handleCancel = () => {
    window.location.href = "/DataKaryawan";
  };

  const preventInvalidInput = (e) => {
    if (["e", "E", "-", "+", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="py-8 w-full max-w-7xl">
        <div className="form-1 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Tambah Data Karyawan
          </h1>
          <form onSubmit={handleSubmitWithConfirmation}>
            <div className="form-2 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">Data Diri</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "nama", type: "text" },
                  { name: "foto", type: "file" },
                  {
                    name: "jenis_kelamin",
                    type: "select",
                    options: jenisKelaminOptions,
                  },
                  { name: "tempat_lahir", type: "text" },
                  { name: "tanggal_lahir", type: "date" },
                  {
                    name: "golongan_darah",
                    type: "select",
                    options: golonganDarahOptions,
                  },
                  { name: "nik", type: "number" },
                  { name: "no_kk", type: "number" },
                  { name: "no_telepon", type: "number" },
                  { name: "no_rekening", type: "number" },
                  { name: "email", type: "text" },
                  { name: "email_gov", type: "text" },
                ].map(({ name, type, options }) => (
                  <div className="mb-4" key={name}>
                    <label className="block text-gray-700 mb-2" htmlFor={name}>
                      {name.replace("_", " ").toUpperCase()}
                    </label>
                    {type === "select" ? (
                      <select
                        id={name}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[name] = el)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      >
                        <option value="" disabled>
                          Select {name.replace("_", " ")}
                        </option>
                        {options.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : type === "file" ? (
                      <input
                        id={name}
                        name={name}
                        type={type}
                        accept=".png, .jpg, .jpeg"
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[name] = el)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      />
                    ) : (
                      <input
                        id={name}
                        name={name}
                        type={type}
                        value={formData[name]}
                        onChange={handleChange}
                        onKeyDown={
                          type === "number" ? preventInvalidInput : null
                        }
                        ref={(el) => (inputRefs.current[name] = el)}
                        className={`border border-gray-300 rounded-md p-2 w-full ${
                          errors[name] ? "border-red-500" : ""
                        }`}
                      />
                    )}
                    {errors[name] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[name]}
                      </p>
                    )}
                    {name === "foto" && (
                      <p className="text-red-400 text-sm mt-1">
                        * Hanya file .png, .jpg, .jpeg dengan ukuran 1 MB yang
                        diterima
                      </p>
                    )}
                    {name === "foto" && fotoPreview && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mt-4">
                          Photo Preview
                        </label>
                        <img
                          src={fotoPreview}
                          className="mt-2 w-24 object-cover"
                        />
                      </div>
                    )}
                    {name === "tanggal_lahir" && (
                      <p className="text-red-400 text-sm mt-1">
                        * format : bulan/tanggal/tahun
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-3 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">Alamat</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "kabupaten",
                  "kecamatan",
                  "desa",
                  "jalan",
                  "alamat_lengkap",
                ].map((key) => (
                  <div className="mb-4" key={key}>
                    <label className="block text-gray-700 mb-2" htmlFor={key}>
                      {key.replace("_", " ").toUpperCase()}
                    </label>
                    <input
                      type="text"
                      id={key}
                      name={key}
                      value={formData[key]}
                      onChange={handleChange}
                      ref={(el) => (inputRefs.current[key] = el)}
                      className="border border-gray-300 rounded-md p-2 w-full"
                    />
                    {errors[key] && (
                      <p className="text-red-500 text-sm">{errors[key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-4 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">Pendidikan</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["pendidikan", "jurusan", "tahun_tamat"].map((key) => {
                  const isNumberField = ["tahun_tamat"].includes(key);

                  return (
                    <div className="mb-4" key={key}>
                      <label className="block text-gray-700 mb-2" htmlFor={key}>
                        {key.replace("_", " ").toUpperCase()}
                      </label>
                      <input
                        type={isNumberField ? "number" : "text"}
                        id={key}
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        onKeyDown={
                          isNumberField === "number"
                            ? preventInvalidInput
                            : null
                        }
                        ref={(el) => (inputRefs.current[key] = el)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      />
                      {errors[key] && (
                        <p className="text-red-500 text-sm">{errors[key]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-5 bg-white shadow-xl overflow-hidden sm:rounded-lg p-6 my-4">
              <h1 className="text-xl font-bold mb-6 text-start">Pekerjaan</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "nip", type: "number" },
                  { name: "npwp", type: "number" },
                  { name: "bidang", type: "text" },
                  { name: "eselon", type: "text" },
                  { name: "sub_bidang", type: "text" },
                  { name: "jabatan_terakhir", type: "text" },
                  { name: "gol_ruang", type: "text" },
                  { name: "jenjang", type: "text" },
                  { name: "jenis", type: "select", options: jenisOptions },
                  { name: "jenis_tekon", type: "text" },
                  { name: "tahun_sk_awal", type: "number" },
                  { name: "tahun_sk_akhir", type: "number" },
                  { name: "masa_kerja", type: "number" },
                  {
                    name: "Kelas_jabatan",
                    type: "select",
                    options: kelasJabatanOptions,
                  },
                  { name: "no_req_bkn", type: "text" },
                ].map(({ name, type, options }) => (
                  <div className="mb-4" key={name}>
                    <label className="block text-gray-700 mb-2" htmlFor={name}>
                      {name.replace("_", " ").toUpperCase()}
                    </label>
                    {type === "select" ? (
                      <select
                        id={name}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        ref={(el) => (inputRefs.current[name] = el)}
                        className="border border-gray-300 rounded-md p-2 w-full"
                      >
                        <option value="" disabled>
                          Select {name.replace("_", " ")}
                        </option>
                        {options.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={name}
                        name={name}
                        type={type}
                        value={formData[name]}
                        onChange={handleChange}
                        onKeyDown={
                          type === "number" ? preventInvalidInput : null
                        }
                        ref={(el) => (inputRefs.current[name] = el)}
                        className={`border border-gray-300 rounded-md p-2 w-full ${
                          errors[name] ? "border-red-500" : ""
                        }`}
                      />
                    )}
                    {errors[name] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[name]}
                      </p>
                    )}
                    {(name === "sub_bidang" || name === "eselon") && (
                      <p className="text-red-400 text-sm mt-1">
                        * Isi ( - ) jika tidak ada
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-black py-2 px-4 rounded-md"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Konfirmasi</h2>
            <p className="mb-4">
              Apakah Anda yakin ingin menambahkan data ini?
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleCancelModal}
                className="bg-gray-300 text-black py-2 px-4 rounded-md mr-2"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmModal}
                className="bg-blue-500 text-white py-2 px-4 rounded-md"
              >
                Ya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TambahData;
