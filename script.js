const STORAGE_KEY = "bracketbase-state-v1";

const defaultState = {
    tournament: {
        name: "",
        format: "League",
        category: "",
        notes: "",
    },
    tournaments: [],
    importMeta: {
        categories: [],
        duplicateEntries: [],
        invalidEntries: [],
        duplicateKeys: [],
    },
    teams: [],
    matches: [],
    announcements: [],
};

let state = loadState();
let tournamentMode = "";
let activeTournamentId = "";
let ballotTournamentId = "";
let bracketTournamentId = "";
let bracketZoom = 1;
let sidebarCollapsed = false;
let bracketEditMode = false;
let bracketDirty = false;
let bracketDraft = null;
let selectedBracketSwapSlot = null;

const elements = {
    pageShell: document.querySelector(".page-shell"),
    navItems: document.querySelectorAll(".nav-item"),
    panels: document.querySelectorAll(".section-panel"),
    sidebar: document.getElementById("sidebar"),
    sidebarToggleButton: document.getElementById("sidebarToggleButton"),
    summaryTournament: document.getElementById("summaryTournament"),
    summaryTeams: document.getElementById("summaryTeams"),
    summaryMatches: document.getElementById("summaryMatches"),
    overviewTournamentCount: document.getElementById("overviewTournamentCount"),
    overviewRoundCard: document.getElementById("overviewRoundCard"),
    overviewPlayersCard: document.getElementById("overviewPlayersCard"),
    overviewCompletedCard: document.getElementById("overviewCompletedCard"),
    overviewStage: document.getElementById("overviewStage"),
    overviewTeams: document.getElementById("overviewTeams"),
    overviewCompleted: document.getElementById("overviewCompleted"),
    overviewTournamentList: document.getElementById("overviewTournamentList"),
    createTournamentButton: document.getElementById("createTournamentButton"),
    editTournamentButton: document.getElementById("editTournamentButton"),
    tournamentModeStatus: document.getElementById("tournamentModeStatus"),
    tournamentWorkflow: document.getElementById("tournamentWorkflow"),
    editTournamentPicker: document.getElementById("editTournamentPicker"),
    editTournamentSelect: document.getElementById("editTournamentSelect"),
    editTournamentOptions: document.getElementById("editTournamentOptions"),
    duplicateEntriesSection: document.getElementById("duplicateEntriesSection"),
    invalidEntriesSection: document.getElementById("invalidEntriesSection"),
    tournamentForm: document.getElementById("tournamentForm"),
    tournamentName: document.getElementById("tournamentName"),
    tournamentFormat: document.getElementById("tournamentFormat"),
    tournamentCategory: document.getElementById("tournamentCategory"),
    tournamentNotes: document.getElementById("tournamentNotes"),
    tournamentSaveStatus: document.getElementById("tournamentSaveStatus"),
    manualPlayerForm: document.getElementById("manualPlayerForm"),
    manualPlayerName: document.getElementById("manualPlayerName"),
    manualRegistrationNumber: document.getElementById("manualRegistrationNumber"),
    manualAadhar: document.getElementById("manualAadhar"),
    manualOrganization: document.getElementById("manualOrganization"),
    manualCategory: document.getElementById("manualCategory"),
    manualContact: document.getElementById("manualContact"),
    manualPlayerStatus: document.getElementById("manualPlayerStatus"),
    importFile: document.getElementById("importFile"),
    importFileButton: document.getElementById("importFileButton"),
    detectedCategories: document.getElementById("detectedCategories"),
    importStatus: document.getElementById("importStatus"),
    duplicateEntriesList: document.getElementById("duplicateEntriesList"),
    invalidEntriesList: document.getElementById("invalidEntriesList"),
    teamsList: document.getElementById("teamsList"),
    downloadModeSelect: document.getElementById("downloadModeSelect"),
    downloadButton: document.getElementById("downloadButton"),
    filterCategorySelect: document.getElementById("filterCategorySelect"),
    filterOrganizationSelect: document.getElementById("filterOrganizationSelect"),
    playersRegistrationCount: document.getElementById("playersRegistrationCount"),
    playersAadharCount: document.getElementById("playersAadharCount"),
    playersCategoryCount: document.getElementById("playersCategoryCount"),
    playersOrganizationCount: document.getElementById("playersOrganizationCount"),
    ballotTournamentSelect: document.getElementById("ballotTournamentSelect"),
    ballotExportButton: document.getElementById("ballotExportButton"),
    ballotPlayerCount: document.getElementById("ballotPlayerCount"),
    ballotOrganizationCount: document.getElementById("ballotOrganizationCount"),
    ballotCategoryLabel: document.getElementById("ballotCategoryLabel"),
    ballotTournamentLabel: document.getElementById("ballotTournamentLabel"),
    ballotList: document.getElementById("ballotList"),
    bracketTournamentSelect: document.getElementById("bracketTournamentSelect"),
    generateBracketButton: document.getElementById("generateBracketButton"),
    bracketEditButton: document.getElementById("bracketEditButton"),
    bracketSaveButton: document.getElementById("bracketSaveButton"),
    exportBracketCsvButton: document.getElementById("exportBracketCsvButton"),
    exportBracketExcelButton: document.getElementById("exportBracketExcelButton"),
    exportBracketPdfButton: document.getElementById("exportBracketPdfButton"),
    bracketZoomOutButton: document.getElementById("bracketZoomOutButton"),
    bracketZoomInButton: document.getElementById("bracketZoomInButton"),
    bracketZoomResetButton: document.getElementById("bracketZoomResetButton"),
    bracketZoomLabel: document.getElementById("bracketZoomLabel"),
    bracketStatus: document.getElementById("bracketStatus"),
    bracketPlayerCount: document.getElementById("bracketPlayerCount"),
    bracketSizeCount: document.getElementById("bracketSizeCount"),
    bracketByeCount: document.getElementById("bracketByeCount"),
    bracketRoundCount: document.getElementById("bracketRoundCount"),
    bracketRounds: document.getElementById("bracketRounds"),
    standingsTable: document.getElementById("standingsTable"),
    standingsContext: document.getElementById("standingsContext"),
    standingsCategory: document.getElementById("standingsCategory"),
    announcementForm: document.getElementById("announcementForm"),
    announcementText: document.getElementById("announcementText"),
    announcementsList: document.getElementById("announcementsList"),
    resetAppButton: document.getElementById("resetAppButton"),
    teamCardTemplate: document.getElementById("teamCardTemplate"),
    announcementTemplate: document.getElementById("announcementTemplate"),
};

bindEvents();
renderAll();

function bindEvents() {
    if (elements.sidebarToggleButton) {
        elements.sidebarToggleButton.addEventListener("click", () => {
            sidebarCollapsed = !sidebarCollapsed;
            renderSidebarState();
        });
    }

    elements.navItems.forEach((item) => {
        item.addEventListener("click", () => {
            const section = item.dataset.section;
            elements.navItems.forEach((nav) => nav.classList.toggle("active", nav === item));
            elements.panels.forEach((panel) => {
                panel.classList.toggle("active", panel.dataset.section === section);
            });
        });
    });

    elements.tournamentForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!elements.tournamentCategory.value) {
            window.alert("Please choose a category before saving the tournament.");
            return;
        }
        state.tournament = {
            name: elements.tournamentName.value.trim(),
            format: elements.tournamentFormat.value,
            category: elements.tournamentCategory.value,
            notes: elements.tournamentNotes.value.trim(),
        };
        saveTournamentEntry();
        const savedLabel = `${state.tournament.name} - ${state.tournament.category}`;
        tournamentMode = "";
        activeTournamentId = "";
        resetWorkingTournament();
        persist();
        renderAll();
        setTournamentModeStatus(`Saved tournament ${savedLabel}. Choose Create or Edit to continue.`);
    });

    if (elements.createTournamentButton) {
        elements.createTournamentButton.addEventListener("click", () => {
            tournamentMode = "create";
            activeTournamentId = "";
            resetWorkingTournament();
            setTournamentModeStatus("");
            renderAll();
        });
    }

    if (elements.editTournamentButton) {
        elements.editTournamentButton.addEventListener("click", () => {
            tournamentMode = "edit";
            activeTournamentId = "";
            state.tournament = {
                name: "",
                format: "League",
                category: "",
                notes: "",
            };
            state.importMeta = cloneState(defaultState.importMeta);
            state.teams = [];
            state.matches = [];
            state.announcements = [];
            renderEditTournamentOptions();
            setTournamentModeStatus("");
            renderAll();
        });
    }

    if (elements.editTournamentSelect) {
        elements.editTournamentSelect.addEventListener("change", () => {
            const selectedId = elements.editTournamentSelect.value;
            const selected = state.tournaments.find((item) => item.id === selectedId);
            if (!selected) {
                activeTournamentId = "";
                return;
            }
            loadTournamentEntry(selectedId);
            setTournamentModeStatus("");
            renderAll();
        });
    }

    if (elements.manualPlayerForm) {
        elements.manualPlayerForm.addEventListener("submit", (event) => {
            event.preventDefault();
            addManualPlayer();
        });
    }

    elements.importFileButton.addEventListener("click", async () => {
        const file = elements.importFile.files?.[0];
        if (!file) {
            setImportStatus("Choose a CSV file first.");
            return;
        }

        const text = await file.text();
        importPlayersFromCsv(text, "CSV file");
    });

    if (elements.standingsCategory) {
        elements.standingsCategory.addEventListener("change", () => {
            renderStandings();
        });
    }

    if (elements.downloadButton) {
        elements.downloadButton.addEventListener("click", () => {
            const mode = elements.downloadModeSelect?.value || "all_players";
            const category = elements.filterCategorySelect?.value || "";
            const organization = elements.filterOrganizationSelect?.value || "";

            if (mode === "all_players") {
                exportPlayersCsv(state.teams, "players-list.csv");
                return;
            }

            if (mode === "duplicate_entries") {
                exportSkippedCsv(state.importMeta.duplicateEntries || [], "duplicate-entries.csv");
                return;
            }

            if (mode === "invalid_entries") {
                exportSkippedCsv(state.importMeta.invalidEntries || [], "invalid-entries.csv");
                return;
            }

            if (mode === "by_category") {
                const filtered = category
                    ? state.teams.filter((team) => String(team.category || "").trim() === category)
                    : [...state.teams].sort((a, b) =>
                        String(a.category || "").localeCompare(String(b.category || "")) ||
                        String(a.name || "").localeCompare(String(b.name || ""))
                    );
                exportPlayersCsv(filtered, `players-category-${slugify(category || "all")}.csv`);
                return;
            }

            if (mode === "by_organization") {
                const filtered = organization
                    ? state.teams.filter((team) => String(team.organization || "").trim() === organization)
                    : [...state.teams].sort((a, b) =>
                        String(a.organization || "").localeCompare(String(b.organization || "")) ||
                        String(a.name || "").localeCompare(String(b.name || ""))
                    );
                exportPlayersCsv(filtered, `players-organization-${slugify(organization || "all")}.csv`);
            }
        });
    }

    if (elements.filterCategorySelect) {
        elements.filterCategorySelect.addEventListener("change", () => {
            renderTeams();
        });
    }

    if (elements.filterOrganizationSelect) {
        elements.filterOrganizationSelect.addEventListener("change", () => {
            renderTeams();
        });
    }

    if (elements.ballotTournamentSelect) {
        elements.ballotTournamentSelect.addEventListener("change", () => {
            ballotTournamentId = elements.ballotTournamentSelect.value || "";
            renderBallot();
        });
    }

    if (elements.ballotExportButton) {
        elements.ballotExportButton.addEventListener("click", () => {
            const ballotPlayers = getBallotPlayers();
            if (ballotPlayers.length === 0) {
                return;
            }

            const currentTournament = state.tournaments.find((item) => item.id === ballotTournamentId);
            const label = currentTournament
                ? `${currentTournament.name}-${currentTournament.category}`
                : "ballot";
            exportBallotCsv(ballotPlayers, `ballot-${slugify(label)}.csv`);
        });
    }

    if (elements.bracketTournamentSelect) {
        elements.bracketTournamentSelect.addEventListener("change", () => {
            if (bracketEditMode && bracketDirty && !window.confirm("Discard the current unsaved bracket changes and switch tournaments?")) {
                elements.bracketTournamentSelect.value = bracketTournamentId || "";
                return;
            }

            bracketEditMode = false;
            bracketDirty = false;
            bracketDraft = null;
            selectedBracketSwapSlot = null;
            bracketTournamentId = elements.bracketTournamentSelect.value || "";
            renderBracket();
        });
    }

      if (elements.generateBracketButton) {
          elements.generateBracketButton.addEventListener("click", () => {
              if (!bracketTournamentId) {
                  setBracketStatus("Choose a saved tournament before generating a bracket.");
                  return;
            }

            const generated = generateBracketForTournament(bracketTournamentId);
              if (!generated) {
                  return;
              }

              bracketEditMode = false;
              bracketDirty = false;
              bracketDraft = null;
              selectedBracketSwapSlot = null;
              persist();
              renderAll();
              setBracketStatus("Bracket generated for the selected tournament.");
          });
      }

      if (elements.bracketEditButton) {
          elements.bracketEditButton.addEventListener("click", () => {
              const currentTournament = state.tournaments.find((item) => item.id === bracketTournamentId);
              if (!currentTournament?.bracket) {
                  setBracketStatus("Generate a bracket for the selected tournament before editing it.");
                  return;
              }

              if (bracketEditMode) {
                  if (bracketDirty && !window.confirm("Discard the current unsaved bracket changes?")) {
                      return;
                  }

                  bracketEditMode = false;
                  bracketDirty = false;
                  bracketDraft = null;
                  selectedBracketSwapSlot = null;
                  renderBracket();
                  setBracketStatus("Bracket edit mode closed.");
                  return;
              }

              bracketEditMode = true;
              bracketDirty = false;
              bracketDraft = cloneState(currentTournament.bracket);
              selectedBracketSwapSlot = null;
              renderBracket();
              setBracketStatus("Edit mode is on. Click one slot, then another slot to swap players. Save when you're done.");
          });
      }

      if (elements.bracketSaveButton) {
          elements.bracketSaveButton.addEventListener("click", () => {
              const tournamentIndex = state.tournaments.findIndex((item) => item.id === bracketTournamentId);
              if (tournamentIndex === -1 || !bracketEditMode || !bracketDraft) {
                  setBracketStatus("Nothing to save yet.");
                  return;
              }

              if (!bracketDirty) {
                  setBracketStatus("No bracket changes to save.");
                  return;
              }

              if (!window.confirm("Save the current bracket changes?")) {
                  return;
              }

              state.tournaments[tournamentIndex].bracket = cloneState(bracketDraft);
              bracketEditMode = false;
              bracketDirty = false;
              bracketDraft = null;
              selectedBracketSwapSlot = null;
              persist();
              renderAll();
              setBracketStatus("Bracket changes saved.");
          });
      }

      if (elements.exportBracketPdfButton) {
          elements.exportBracketPdfButton.addEventListener("click", () => {
              const currentTournament = state.tournaments.find((item) => item.id === bracketTournamentId);
              if (!currentTournament) {
                setBracketStatus("Choose a saved tournament before exporting the bracket.");
                return;
            }
              if (!currentTournament.bracket) {
                  setBracketStatus("Generate the bracket before exporting it.");
                  return;
              }
              exportBracketPdf(currentTournament);
          });
      }

      if (elements.exportBracketCsvButton) {
          elements.exportBracketCsvButton.addEventListener("click", () => {
              const currentTournament = state.tournaments.find((item) => item.id === bracketTournamentId);
              if (!currentTournament) {
                  setBracketStatus("Choose a saved tournament before exporting the bracket.");
                  return;
              }
              if (!currentTournament.bracket) {
                  setBracketStatus("Generate the bracket before exporting it.");
                  return;
              }
              exportBracketCsv(currentTournament);
          });
      }

      if (elements.exportBracketExcelButton) {
          elements.exportBracketExcelButton.addEventListener("click", () => {
              const currentTournament = state.tournaments.find((item) => item.id === bracketTournamentId);
              if (!currentTournament) {
                  setBracketStatus("Choose a saved tournament before exporting the bracket.");
                  return;
              }
              if (!currentTournament.bracket) {
                  setBracketStatus("Generate the bracket before exporting it.");
                  return;
              }
              exportBracketExcel(currentTournament);
          });
      }

      if (elements.bracketZoomOutButton) {
        elements.bracketZoomOutButton.addEventListener("click", () => {
            bracketZoom = Math.max(0.6, Number((bracketZoom - 0.1).toFixed(2)));
            renderBracket();
        });
    }

    if (elements.bracketZoomInButton) {
        elements.bracketZoomInButton.addEventListener("click", () => {
            bracketZoom = Math.min(1.8, Number((bracketZoom + 0.1).toFixed(2)));
            renderBracket();
        });
    }

    if (elements.bracketZoomResetButton) {
        elements.bracketZoomResetButton.addEventListener("click", () => {
            bracketZoom = 1;
            renderBracket();
        });
    }

    elements.announcementForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const message = elements.announcementText.value.trim();
        if (!message) {
            return;
        }

        state.announcements.unshift({
            id: createId(),
            message,
        });

        elements.announcementForm.reset();
        persist();
        renderAll();
    });

    elements.resetAppButton.addEventListener("click", () => {
        state = cloneState(defaultState);
        tournamentMode = "";
        activeTournamentId = "";
        persist();
        renderAll();
    });
}

function renderAll() {
    renderSidebarState();
    renderTournamentForm();
    renderSummary();
    renderOverviewFixed();
    renderTeams();
    renderBallotTournamentOptions();
    renderBallot();
    renderBracketTournamentOptions();
    renderBracket();
    renderStandings();
    renderAnnouncements();
    renderDetectedCategories();
    renderSkippedEntries();
    renderStandingsCategoryOptions();
    renderManualCategoryOptions();
    renderPlayersSummary();
    renderFilterCategoryOptions();
    renderFilterOrganizationOptions();
    renderEditTournamentOptions();
    renderTournamentMode();
}

function renderSidebarState() {
    if (!elements.sidebar || !elements.sidebarToggleButton || !elements.pageShell) {
        return;
    }

    elements.sidebar.classList.toggle("collapsed", sidebarCollapsed);
    elements.pageShell.classList.toggle("sidebar-collapsed", sidebarCollapsed);
    elements.sidebarToggleButton.textContent = sidebarCollapsed ? ">" : "<";
    elements.sidebarToggleButton.setAttribute("aria-label", sidebarCollapsed ? "Expand menu" : "Collapse menu");
}

function addManualPlayer() {
    const name = elements.manualPlayerName?.value.trim() || "";
    const registrationNumber = elements.manualRegistrationNumber?.value.trim() || "";
    const aadhar = elements.manualAadhar?.value.trim() || "";
    const organization = elements.manualOrganization?.value.trim() || "";
    const category = elements.manualCategory?.value.trim() || "";
    const contact = elements.manualContact?.value.trim() || "";

    if (!name) {
        setManualPlayerStatus("Player name is required.");
        return;
    }

    const identityKey = buildPlayerIdentityKey({
        registrationNumber,
        aadhar,
        organization,
        category,
    });

    if (!identityKey) {
        setManualPlayerStatus("Manual entry needs registration number or Aadhar, plus organization and category.");
        return;
    }

    const exists = state.teams.some((team) => buildPlayerIdentityKey(team) === identityKey);
    if (exists) {
        setManualPlayerStatus("That player already exists for the same identity combination.");
        return;
    }

    state.teams.push({
        id: createId(),
        name,
        contact,
        registrationNumber,
        aadhar,
        organization,
        category,
        source: "Manual entry",
    });

    state.importMeta.categories = Array.from(
        new Set([...(state.importMeta.categories || []), category].filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    elements.manualPlayerForm.reset();
    persist();
    renderAll();
    setManualPlayerStatus(`Added player ${name}.`);
}

function resetWorkingTournament() {
    state.tournament = {
        name: "",
        format: "League",
        category: "",
        notes: "",
    };
    state.importMeta = cloneState(defaultState.importMeta);
    state.teams = [];
    state.matches = [];
    state.announcements = [];
    activeTournamentId = "";
    if (elements.importFile) {
        elements.importFile.value = "";
    }
    setImportStatus("No spreadsheet imported yet.");
    setManualPlayerStatus("No manual player added yet.");
    setTournamentSaveStatus("No tournament saved yet.");
}

function loadTournamentEntry(tournamentId) {
    const selectedIndex = state.tournaments.findIndex((item) => item.id === tournamentId);
    if (selectedIndex === -1) {
        return false;
    }

    const selected = state.tournaments[selectedIndex];
    const selectedCategory = String(selected.category || "").trim();
    const sanitizedTeams = normalizeTeams(selected.teams).filter(
        (team) => String(team.category || "").trim() === selectedCategory
    );
    const sanitizedMatches = Array.isArray(selected.matches)
        ? cloneState(selected.matches).filter((match) => {
            const allowedIds = new Set(sanitizedTeams.map((team) => team.id));
            return allowedIds.has(match.teamA) && allowedIds.has(match.teamB);
        })
        : [];

    activeTournamentId = selected.id;
    state.tournament = {
        name: selected.name || "",
        format: selected.format || "League",
        category: selected.category || "",
        notes: selected.notes || "",
    };
    state.importMeta = {
        ...normalizeImportMeta(selected.importMeta),
        categories: selectedCategory ? [selectedCategory] : [],
        duplicateEntries: [],
        invalidEntries: [],
        duplicateKeys: [],
    };
    state.teams = sanitizedTeams;
    state.matches = sanitizedMatches;
    state.announcements = Array.isArray(selected.announcements) ? cloneState(selected.announcements) : [];
    state.tournaments[selectedIndex] = {
        ...selected,
        teams: cloneState(sanitizedTeams),
        playerCount: sanitizedTeams.length,
        importMeta: {
            ...normalizeImportMeta(selected.importMeta),
            categories: selectedCategory ? [selectedCategory] : [],
        },
        matches: cloneState(sanitizedMatches),
    };
    if (elements.filterCategorySelect) {
        elements.filterCategorySelect.value = "";
    }
    if (elements.filterOrganizationSelect) {
        elements.filterOrganizationSelect.value = "";
    }
    setImportStatus(
        state.teams.length > 0
            ? `Loaded ${state.teams.length} player(s) from ${selected.name} - ${selected.category}.`
            : "No spreadsheet imported yet."
    );
    setManualPlayerStatus("No manual player added yet.");
    setTournamentSaveStatus(`Loaded tournament ${selected.name} - ${selected.category}.`);
    persist();
    return true;
}

function saveTournamentEntry() {
    const tournamentCategory = String(state.tournament.category || "").trim();
    const tournamentTeams = normalizeTeams(state.teams).filter(
        (team) => String(team.category || "").trim() === tournamentCategory
    );
    const allowedIds = new Set(tournamentTeams.map((team) => team.id));
    const playerCount = getTournamentPlayers().length;
    const existingIndex = state.tournaments.findIndex(
        (item) => (tournamentMode === "edit" && item.id === activeTournamentId)
            || (item.name === state.tournament.name && item.category === state.tournament.category)
    );

    const entry = {
        id: existingIndex === -1 ? createId() : state.tournaments[existingIndex].id,
        name: state.tournament.name,
        format: state.tournament.format,
        category: state.tournament.category,
        notes: state.tournament.notes,
        playerCount: tournamentTeams.length,
        teams: cloneState(tournamentTeams),
        importMeta: {
            categories: tournamentCategory ? [tournamentCategory] : [],
            duplicateEntries: cloneState(state.importMeta.duplicateEntries || []),
            invalidEntries: cloneState(state.importMeta.invalidEntries || []),
            duplicateKeys: cloneState(state.importMeta.duplicateKeys || []),
        },
        matches: cloneState(
            state.matches.filter((match) => allowedIds.has(match.teamA) && allowedIds.has(match.teamB))
        ),
        announcements: cloneState(state.announcements),
        bracket: existingIndex === -1 ? null : cloneState(state.tournaments[existingIndex].bracket || null),
    };

    if (existingIndex === -1) {
        state.tournaments.push(entry);
    } else {
        state.tournaments[existingIndex] = entry;
    }

    activeTournamentId = entry.id;
}

function importPlayersFromCsv(csvText, sourceLabel) {
    const rows = parseCsv(csvText);
    if (rows.length < 2) {
        setImportStatus(`${sourceLabel}: no data rows found.`);
        return;
    }

    const headers = rows[0].map(normalizeHeader);
    const nameIndex = findHeaderIndex(headers, [
        "player",
        "name",
        "player name",
        "name of the player",
        "name of the player in capitals",
    ]);
    const contactIndex = findHeaderIndex(headers, [
        "contact",
        "phone",
        "mobile",
        "phone number",
    ]);
    const registrationIndex = findHeaderIndex(headers, [
        "player registration number",
        "registration number",
        "registration no",
        "registration no",
    ]);
    const aadharIndex = findHeaderIndex(headers, [
        "aadhar",
        "aadhar number",
        "aadhaar",
        "aadhaar number",
    ]);
    const organizationIndex = findHeaderIndex(headers, [
        "name of the organization institution",
        "organization",
        "organization institution",
        "institution",
        "club",
    ]);
    const categoryIndex = findHeaderIndex(headers, [
        "category",
    ]);

    if (nameIndex === -1) {
        setImportStatus(`${sourceLabel}: missing a player/name column. Detected headers: ${headers.join(" | ")}`);
        return;
    }

    let added = 0;
    let skipped = 0;
    let duplicateCount = 0;
    let missingNameCount = 0;
    let missingIdentityCount = 0;
    const detectedCategories = new Set();
    const addedCategories = new Set();
    const duplicateEntries = [];
    const invalidEntries = [];
    const duplicateKeys = new Set();
    const existingKeys = new Set(
        state.teams.map((team) => buildPlayerIdentityKey(team)).filter(Boolean)
    );

    rows.slice(1).forEach((row) => {
        const name = (row[nameIndex] || "").trim();
        const contact = contactIndex === -1 ? "" : (row[contactIndex] || "").trim();
        const registrationNumber = registrationIndex === -1 ? "" : (row[registrationIndex] || "").trim();
        const aadhar = aadharIndex === -1 ? "" : (row[aadharIndex] || "").trim();
        const organization = organizationIndex === -1 ? "" : (row[organizationIndex] || "").trim();
        const category = categoryIndex === -1 ? "" : (row[categoryIndex] || "").trim();
        const identityKey = buildPlayerIdentityKey({
            registrationNumber,
            aadhar,
            organization,
            category,
        });

        if (category) {
            detectedCategories.add(category);
        }

        if (!name) {
            skipped += 1;
            missingNameCount += 1;
            invalidEntries.push({
                name: "",
                registrationNumber,
                aadhar,
                organization,
                category,
                reason: "Missing name",
            });
            return;
        }

        if (!identityKey) {
            skipped += 1;
            missingIdentityCount += 1;
            invalidEntries.push({
                name,
                registrationNumber,
                aadhar,
                organization,
                category,
                reason: "Missing registration/Aadhar, organization, or category",
            });
            return;
        }

        if (existingKeys.has(identityKey)) {
            skipped += 1;
            duplicateCount += 1;
            duplicateKeys.add(identityKey);
            duplicateEntries.push({
                name,
                registrationNumber,
                aadhar,
                organization,
                category,
                reason: "Duplicate entry",
            });
            return;
        }

        state.teams.push({
            id: createId(),
            name,
            contact,
            registrationNumber,
            aadhar,
            organization,
            category,
            source: sourceLabel,
        });
        existingKeys.add(identityKey);
        if (category) {
            addedCategories.add(category);
        }
        added += 1;
    });

    state.importMeta.categories = Array.from(
        new Set([...(state.importMeta.categories || []), ...detectedCategories])
    ).sort((a, b) => a.localeCompare(b));
    state.importMeta.duplicateEntries = duplicateEntries;
    state.importMeta.invalidEntries = invalidEntries;
    state.importMeta.duplicateKeys = Array.from(duplicateKeys);

    if (!state.tournament.category) {
        const availableCategories = getAvailableCategories();
        if (availableCategories.length > 0) {
            state.tournament.category = availableCategories[0];
        }
    }

    persist();
    renderAll();
    setImportStatus(
        `${sourceLabel}: imported ${added} player(s), skipped ${skipped}. ` +
        `Duplicates: ${duplicateCount}, missing name: ${missingNameCount}, missing identity fields: ${missingIdentityCount}. ` +
        `Detected categories: ${formatCategoryList(detectedCategories)}. ` +
        `Added categories: ${formatCategoryList(addedCategories)}. ` +
        `Identity uses registration number or Aadhar with organization and category.`
    );
}

function renderTournamentForm() {
    const categories = getAvailableCategories();
    const currentCategory = state.tournament.category;
    const options = categories
        .map((category) => {
            const selected = category === currentCategory ? ' selected' : "";
            return `<option value="${escapeHtml(category)}"${selected}>${escapeHtml(category)}</option>`;
        })
        .join("");

    elements.tournamentCategory.innerHTML = categories.length > 0
        ? options
        : '<option value="">Import players to load categories</option>';

    if (categories.length > 0 && !currentCategory) {
        elements.tournamentCategory.selectedIndex = 0;
    }
    elements.tournamentName.value = state.tournament.name;
    elements.tournamentFormat.value = state.tournament.format;
    elements.tournamentNotes.value = state.tournament.notes;
}

function renderTournamentMode() {
    const showWorkflow = tournamentMode === "create" || (tournamentMode === "edit" && Boolean(activeTournamentId));

    if (elements.tournamentWorkflow) {
        elements.tournamentWorkflow.style.display = showWorkflow ? "" : "none";
    }
    if (elements.tournamentForm) {
        elements.tournamentForm.style.display = showWorkflow ? "" : "none";
    }
    if (elements.tournamentSaveStatus) {
        elements.tournamentSaveStatus.style.display = showWorkflow && elements.tournamentSaveStatus.textContent ? "" : "none";
    }
    if (elements.editTournamentPicker) {
        elements.editTournamentPicker.style.display = tournamentMode === "edit" ? "" : "none";
    }
}

function renderEditTournamentOptions() {
    if (!elements.editTournamentSelect) {
        return;
    }

    if (!Array.isArray(state.tournaments) || state.tournaments.length === 0) {
        elements.editTournamentSelect.innerHTML = '<option value="">No saved tournaments</option>';
        if (elements.editTournamentOptions) {
            elements.editTournamentOptions.innerHTML = "";
        }
        activeTournamentId = "";
        return;
    }

    elements.editTournamentSelect.innerHTML = ['<option value="">Select a tournament</option>']
        .concat(
            state.tournaments.map((item) => {
                const label = `${item.name} - ${item.category}`;
                const selected = tournamentMode === "edit" && item.id === activeTournamentId ? ' selected' : "";
                return `<option value="${item.id}"${selected}>${escapeHtml(label)}</option>`;
            })
        )
        .join("");

    if (elements.editTournamentOptions) {
        elements.editTournamentOptions.innerHTML = "";
        state.tournaments.forEach((item) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = item.id === activeTournamentId ? "button" : "button secondary";
            button.textContent = `${item.name} - ${item.category}`;
            button.addEventListener("click", () => {
                activeTournamentId = item.id;
                if (elements.editTournamentSelect) {
                    elements.editTournamentSelect.value = item.id;
                }
                loadTournamentEntry(item.id);
                setTournamentModeStatus("");
                renderAll();
            });
            elements.editTournamentOptions.appendChild(button);
        });
    }
}

function renderManualCategoryOptions() {
    if (!elements.manualCategory) {
        return;
    }

    const categories = getAvailableCategories();
    const selected = elements.manualCategory.value;
    elements.manualCategory.innerHTML = categories.length > 0
        ? ['<option value="">Select category</option>']
            .concat(
                categories.map((category) => {
                    const isSelected = category === selected ? ' selected' : "";
                    return `<option value="${escapeHtml(category)}"${isSelected}>${escapeHtml(category)}</option>`;
                })
            )
            .join("")
        : '<option value="">Import players to load categories</option>';
}

function generateBracketForTournament(tournamentId) {
    const tournamentIndex = state.tournaments.findIndex((item) => item.id === tournamentId);
    if (tournamentIndex === -1) {
        setBracketStatus("Saved tournament not found.");
        return false;
    }

    const tournament = state.tournaments[tournamentIndex];
    const players = getBracketPlayers(tournament);
    if (players.length < 2) {
        setBracketStatus("At least 2 entries are needed to create a bracket.");
        return false;
    }

    let bracket = null;
    if (String(tournament.format || "").trim() === "Double Elimination") {
        bracket = buildDoubleEliminationBracketData(players);
    } else {
        bracket = buildSingleEliminationBracketData(players);
    }

    state.tournaments[tournamentIndex] = {
        ...tournament,
        bracket,
    };

    return true;
}

function buildSingleEliminationBracketData(players, startSequence = 1) {
    const size = getBracketSize(players.length);
    const byes = size - players.length;
    const seedPositions = getSeedPositions(size);
    const arrangedPlayers = arrangePlayersForBracket(players, seedPositions, size);
    const seededSlots = Array.from({ length: size }, () => null);

    arrangedPlayers.forEach((player, index) => {
        const bracketPosition = seedPositions[index];
        if (!bracketPosition) {
            return;
        }
        seededSlots[bracketPosition - 1] = {
            id: player.id,
            name: player.name,
            registrationNumber: player.registrationNumber,
            aadhar: player.aadhar,
            organization: player.organization,
            category: player.category,
            contact: player.contact,
            seed: index + 1,
        };
    });

    const rounds = [];
    let currentEntries = seededSlots.map((player) => (
        player
            ? {
                type: "player",
                label: formatBracketPlayerLabel(player),
                seed: player.seed,
                bye: false,
            }
            : { type: "bye", label: "BYE" }
    ));
    let matchSequence = startSequence;
    const roundCount = Math.log2(size);

    for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
        const matches = [];
        const nextEntries = [];

        for (let matchIndex = 0; matchIndex < currentEntries.length; matchIndex += 2) {
            const slotA = currentEntries[matchIndex];
            const slotB = currentEntries[matchIndex + 1];
            const autoAdvance = getAutoAdvanceEntry(slotA, slotB);
            const label = autoAdvance ? "Auto advance" : `Match ${matchSequence}`;
            const roundLabel = getBracketRoundLabel(roundIndex, roundCount);
            matches.push({
                label,
                displayLabel: autoAdvance ? roundLabel : `${roundLabel} - ${label}`,
                slotA: slotA?.label || "TBD",
                slotB: slotB?.label || "TBD",
                seedA: slotA?.seed || "",
                seedB: slotB?.seed || "",
                byeA: Boolean(slotA?.bye),
                byeB: Boolean(slotB?.bye),
                isPlayable: !autoAdvance,
            });

            if (autoAdvance) {
                nextEntries.push(autoAdvance);
            } else {
                nextEntries.push({
                    type: "winner_ref",
                    label: `Winner of ${label}`,
                    bye: false,
                });
            }

            if (!autoAdvance) {
                matchSequence += 1;
            }
        }

        rounds.push({ matches });
        currentEntries = nextEntries;
    }

    return {
        type: "single",
        size,
        byes,
        rounds,
        nextMatchSequence: matchSequence,
    };
}

function buildDoubleEliminationBracketData(players) {
    const winners = buildSingleEliminationBracketData(players, 1);
    const losers = buildLosersBracketData(winners.rounds, winners.nextMatchSequence);
    const finals = buildDoubleEliminationFinalsData(winners, losers, losers.nextMatchSequence);

    return {
        type: "double",
        size: winners.size,
        byes: winners.byes,
        winners: {
            size: winners.size,
            byes: winners.byes,
            rounds: winners.rounds,
        },
        losers: {
            size: Math.max(2, Math.ceil(winners.size / 2)),
            byes: 0,
            rounds: losers.rounds,
        },
        finals: {
            size: 2,
            byes: 0,
            rounds: finals.rounds,
        },
        rounds: [
            ...winners.rounds,
            ...losers.rounds,
            ...finals.rounds,
        ],
        nextMatchSequence: finals.nextMatchSequence,
    };
}

function buildLosersBracketData(winnerRounds, startSequence) {
    const rounds = [];
    let matchSequence = startSequence;
    const winnerRoundCount = winnerRounds.length;

    if (winnerRoundCount <= 1) {
        return { rounds, nextMatchSequence: matchSequence };
    }

    for (let losersRoundIndex = 0; losersRoundIndex < (winnerRoundCount - 1) * 2; losersRoundIndex += 1) {
        const roundNumber = losersRoundIndex + 1;
        const roundsRemaining = winnerRoundCount - 1 - Math.floor(losersRoundIndex / 2);
        const matchCount = 2 ** Math.max(0, roundsRemaining - 1);
        const matches = [];

        for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
            const label = `Match ${matchSequence}`;
            const displayLabel = `Losers Round ${roundNumber} - ${label}`;
            const slotA = getLosersBracketSlotLabel(rounds, winnerRounds, losersRoundIndex, matchIndex, "A");
            const slotB = getLosersBracketSlotLabel(rounds, winnerRounds, losersRoundIndex, matchIndex, "B");

            matches.push({
                label,
                displayLabel,
                slotA,
                slotB,
                seedA: "",
                seedB: "",
                byeA: false,
                byeB: false,
                isPlayable: true,
            });

            matchSequence += 1;
        }

        rounds.push({ matches });
    }

    return { rounds, nextMatchSequence: matchSequence };
}

function getLosersBracketSlotLabel(loserRounds, winnerRounds, losersRoundIndex, matchIndex, side) {
    if (losersRoundIndex === 0) {
        const winnerMatchIndex = matchIndex * 2 + (side === "A" ? 0 : 1);
        const winnerMatch = winnerRounds[0]?.matches?.[winnerMatchIndex];
        return winnerMatch?.isPlayable ? `Loser of ${winnerMatch.label}` : "TBD";
    }

    const previousRound = loserRounds[losersRoundIndex - 1]?.matches || [];
    if (losersRoundIndex % 2 === 1) {
        if (side === "A") {
            const previousMatch = previousRound[matchIndex];
            return previousMatch ? `Winner of ${previousMatch.label}` : "TBD";
        }

        const winnerRound = winnerRounds[Math.floor(losersRoundIndex / 2) + 1]?.matches || [];
        const winnerMatch = winnerRound[matchIndex];
        return winnerMatch?.isPlayable ? `Loser of ${winnerMatch.label}` : "TBD";
    }

    const previousMatchIndex = matchIndex * 2 + (side === "A" ? 0 : 1);
    const previousMatch = previousRound[previousMatchIndex];
    return previousMatch ? `Winner of ${previousMatch.label}` : "TBD";
}

function buildDoubleEliminationFinalsData(winners, losers, startSequence) {
    const rounds = [];
    let matchSequence = startSequence;
    const winnersFinal = winners.rounds[winners.rounds.length - 1]?.matches?.[0];
    const losersFinal = losers.rounds[losers.rounds.length - 1]?.matches?.[0];

    if (!winnersFinal || !losersFinal) {
        return { rounds, nextMatchSequence: matchSequence };
    }

    const grandFinalLabel = `Match ${matchSequence}`;
    rounds.push({
        matches: [{
            label: grandFinalLabel,
            displayLabel: `Grand Final - ${grandFinalLabel}`,
            slotA: `Winner of ${winnersFinal.label}`,
            slotB: `Winner of ${losersFinal.label}`,
            seedA: "",
            seedB: "",
            byeA: false,
            byeB: false,
            isPlayable: true,
        }],
    });
    matchSequence += 1;

    const resetLabel = `Match ${matchSequence}`;
    rounds.push({
        matches: [{
            label: resetLabel,
            displayLabel: `Bracket Reset - ${resetLabel}`,
            slotA: `Loser of ${grandFinalLabel}`,
            slotB: `Winner of ${grandFinalLabel}`,
            seedA: "",
            seedB: "",
            byeA: false,
            byeB: false,
            isPlayable: true,
            isOptional: true,
        }],
    });
    matchSequence += 1;

    return { rounds, nextMatchSequence: matchSequence };
}

function renderPlayersSummary() {
    if (!elements.playersRegistrationCount) {
        return;
    }

    const registrationCount = state.teams.filter((team) => String(team.registrationNumber || "").trim() !== "").length;
    const aadharCount = state.teams.filter((team) => String(team.aadhar || "").trim() !== "").length;
    const categoryCount = new Set(state.teams.map((team) => String(team.category || "").trim()).filter(Boolean)).size;
    const organizationCount = new Set(state.teams.map((team) => String(team.organization || "").trim()).filter(Boolean)).size;

    elements.playersRegistrationCount.textContent = String(registrationCount);
    elements.playersAadharCount.textContent = String(aadharCount);
    elements.playersCategoryCount.textContent = String(categoryCount);
    elements.playersOrganizationCount.textContent = String(organizationCount);
}

function getAutoAdvanceEntry(slotA, slotB) {
    if (!slotA && !slotB) {
        return { type: "bye", label: "BYE" };
    }
    if (slotA?.type === "player" && slotB?.type === "bye") {
        return {
            ...slotA,
            bye: true,
        };
    }
    if (slotA?.type === "bye" && slotB?.type === "player") {
        return {
            ...slotB,
            bye: true,
        };
    }
    if (slotA?.type === "player" && !slotB) {
        return {
            ...slotA,
            bye: true,
        };
    }
    if (!slotA && slotB?.type === "player") {
        return {
            ...slotB,
            bye: true,
        };
    }
    return null;
}

function getSeedPositions(size) {
    if (size <= 1) {
        return [1];
    }

    let positions = [1, 2];
    while (positions.length < size) {
        const mirrorBase = positions.length * 2 + 1;
        positions = positions.flatMap((seed) => [seed, mirrorBase - seed]);
    }
    return positions;
}

function arrangePlayersForBracket(players, seedPositions, size) {
    const remaining = players.map((player) => ({ ...player }));
    const seededSlots = Array.from({ length: size }, () => null);
    const arranged = [];

    seedPositions.forEach((bracketPosition) => {
        const slotIndex = bracketPosition - 1;
        const opponentIndex = getFirstRoundOpponentIndex(slotIndex);
        const opponent = seededSlots[opponentIndex];
        const candidateIndex = chooseBracketCandidateIndex(remaining, opponent);

        if (candidateIndex === -1) {
            return;
        }

        const [chosen] = remaining.splice(candidateIndex, 1);
        seededSlots[slotIndex] = chosen;
        arranged.push(chosen);
    });

    return arranged;
}

function getFirstRoundOpponentIndex(slotIndex) {
    return slotIndex % 2 === 0 ? slotIndex + 1 : slotIndex - 1;
}

function chooseBracketCandidateIndex(players, opponent) {
    if (!players.length) {
        return -1;
    }
    if (!opponent) {
        return 0;
    }

    const opponentOrg = getBracketOrganizationIdentity(opponent.organization);
    if (!opponentOrg) {
        return 0;
    }

    const differentOrgIndex = players.findIndex((player) => (
        getBracketOrganizationIdentity(player.organization) !== opponentOrg
    ));

    return differentOrgIndex === -1 ? 0 : differentOrgIndex;
}

function getBracketOrganizationIdentity(value) {
    return String(getDisplayOrganization(value) || "").trim().toLowerCase();
}

function getBracketRoundLabel(roundIndex, roundCount) {
    const remainingRounds = roundCount - roundIndex;
    if (remainingRounds <= 1) {
        return "Final";
    }
    if (remainingRounds === 2) {
        return "Semifinal";
    }
    if (remainingRounds === 3) {
        return "Quarterfinal";
    }

    const fieldSize = 2 ** remainingRounds;
    return `Round of ${fieldSize}`;
}

function getBracketRoundMetrics(roundCount) {
    const cardHeight = 112;
    const baseGap = 18;
    const metrics = [];
    let previousGap = baseGap;

    for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
        if (roundIndex === 0) {
            metrics.push({ gap: baseGap, offset: 0 });
            continue;
        }

        const offset = Math.round((cardHeight + previousGap) / 2);
        const gap = Math.round((cardHeight + previousGap) * 2 - cardHeight);
        metrics.push({ gap, offset });
        previousGap = gap;
    }

    return metrics;
}

function renderBracketSvg(bracket, tournament, options = {}) {
    const layout = getBracketSvgLayout(bracket.rounds);
    const finalRound = bracket.rounds[bracket.rounds.length - 1];
    const championLabel = finalRound?.matches?.[0]
        ? `Winner of ${finalRound.matches[0].label}`
        : "Champion";
    const title = options.title || `${tournament.name} - ${tournament.category}`;
    const sectionKey = options.sectionKey || "main";
    const footerText = options.footerText || "Bracket preview";

    const parts = [
        `<div class="bracket-svg-wrap" style="--bracket-scale:${bracketZoom}; width:${layout.width * bracketZoom}px; height:${layout.height * bracketZoom}px;">`,
        `<svg class="bracket-svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="${escapeHtml(title)} bracket">`,
        `<rect x="0" y="0" width="${layout.width}" height="${layout.height}" rx="24" fill="#081321"></rect>`,
        `<text x="${layout.paddingX}" y="34" class="svg-title">${escapeXml(title)}</text>`,
        `<text x="${layout.paddingX}" y="${layout.height - 14}" class="svg-match-label">${escapeXml(footerText)}</text>`,
    ];

    bracket.rounds.forEach((round, roundIndex) => {
        round.matches.forEach((match, matchIndex) => {
            const matchBox = getSvgMatchBox(layout, roundIndex, matchIndex);
            const topSlotY = matchBox.y + layout.labelHeight;
            const bottomSlotY = topSlotY + layout.slotHeight + layout.slotGap;
            const slotLineStartX = matchBox.x + matchBox.width;
            const mergeX = slotLineStartX + layout.connectorReach;
            const topMidY = topSlotY + layout.slotHeight / 2;
            const bottomMidY = bottomSlotY + layout.slotHeight / 2;
            const mergeMidY = (topMidY + bottomMidY) / 2;

            if (!match.isPlayable) {
                return;
            }

            parts.push(
                `<rect x="${matchBox.x}" y="${matchBox.y}" width="${matchBox.width}" height="${matchBox.height}" rx="18" class="${match.isPlayable ? "svg-match-box" : "svg-match-box svg-match-box-auto"}"></rect>`,
                `<text x="${matchBox.x + 14}" y="${matchBox.y + 18}" class="${match.isPlayable ? "svg-match-label" : "svg-match-label svg-match-label-auto"}">${escapeXml(match.displayLabel || match.label)}</text>`,
                renderSvgSlot(matchBox.x + 12, topSlotY, layout, match.seedA, match.slotA, match.byeA, roundIndex, matchIndex, "slotA", sectionKey),
                renderSvgSlot(matchBox.x + 12, bottomSlotY, layout, match.seedB, match.slotB, match.byeB, roundIndex, matchIndex, "slotB", sectionKey)
            );

            if (roundIndex < bracket.rounds.length - 1) {
                const nextMatchBox = getSvgMatchBox(layout, roundIndex + 1, Math.floor(matchIndex / 2));
                const nextCenterX = nextMatchBox.x;
                const nextCenterY = nextMatchBox.y + layout.labelHeight + layout.slotHeight + layout.slotGap / 2;

                parts.push(
                    `<path d="M ${slotLineStartX} ${topMidY} L ${mergeX} ${topMidY} L ${mergeX} ${bottomMidY} L ${slotLineStartX} ${bottomMidY}" class="svg-connector"></path>`,
                    `<path d="M ${mergeX} ${mergeMidY} L ${nextCenterX - 18} ${mergeMidY} L ${nextCenterX - 18} ${nextCenterY} L ${nextCenterX} ${nextCenterY}" class="svg-connector"></path>`
                );
            } else {
                const championX = layout.paddingX + bracket.rounds.length * layout.columnWidth;
                const championMidY = layout.championY + layout.championHeight / 2;
                parts.push(
                    `<path d="M ${slotLineStartX} ${topMidY} L ${mergeX} ${topMidY} L ${mergeX} ${bottomMidY} L ${slotLineStartX} ${bottomMidY}" class="svg-connector"></path>`,
                    `<path d="M ${mergeX} ${mergeMidY} L ${championX - 24} ${mergeMidY} L ${championX - 24} ${championMidY} L ${championX} ${championMidY}" class="svg-connector"></path>`
                );
            }
        });
    });

    parts.push(
        `<rect x="${layout.paddingX + bracket.rounds.length * layout.columnWidth}" y="${layout.championY}" width="${layout.championWidth}" height="${layout.championHeight}" rx="22" class="svg-champion-box"></rect>`,
        `<text x="${layout.paddingX + bracket.rounds.length * layout.columnWidth + 16}" y="${layout.championY + 24}" class="svg-match-label">Final winner</text>`,
        `<text x="${layout.paddingX + bracket.rounds.length * layout.columnWidth + 16}" y="${layout.championY + 56}" class="svg-champion-name">${escapeXml(championLabel)}</text>`,
        `</svg>`,
        `</div>`
    );

    return parts.join("");
}

function renderSvgSlot(x, y, layout, seed, label, bye, roundIndex, matchIndex, field, sectionKey = "main") {
    const slotLabel = bye ? addByeNoteToLabel(label || "TBD") : (label || "TBD");
    const isSelected = isSelectedBracketSwapSlot(sectionKey, roundIndex, matchIndex, field);
    const slotClass = isSelected ? "svg-slot svg-slot-editable svg-slot-selected" : "svg-slot svg-slot-editable";
    const textClass = isSelected ? "svg-slot-text svg-slot-editable svg-slot-text-selected" : "svg-slot-text svg-slot-editable";
    return [
        `<rect x="${x}" y="${y}" width="${layout.slotWidth}" height="${layout.slotHeight}" rx="12" class="${slotClass}" data-bracket-slot="${escapeHtml(field || "")}" data-bracket-section="${escapeHtml(sectionKey)}" data-round-index="${roundIndex}" data-match-index="${matchIndex}"></rect>`,
        `<rect x="${x + 8}" y="${y + 6}" width="${layout.seedWidth}" height="${layout.slotHeight - 12}" rx="8" class="svg-seed-box"></rect>`,
        `<text x="${x + 8 + layout.seedWidth / 2}" y="${y + layout.slotHeight / 2 + 4}" text-anchor="middle" class="svg-seed-text">${escapeXml(seed || "-")}</text>`,
        `<text x="${x + 8 + layout.seedWidth + 12}" y="${y + layout.slotHeight / 2 + 4}" class="${textClass}" data-bracket-slot="${escapeHtml(field || "")}" data-bracket-section="${escapeHtml(sectionKey)}" data-round-index="${roundIndex}" data-match-index="${matchIndex}">${escapeXml(slotLabel)}</text>`,
    ].join("");
}

function isSelectedBracketSwapSlot(sectionKey, roundIndex, matchIndex, field) {
    return Boolean(
        selectedBracketSwapSlot
        && selectedBracketSwapSlot.sectionKey === sectionKey
        && selectedBracketSwapSlot.roundIndex === roundIndex
        && selectedBracketSwapSlot.matchIndex === matchIndex
        && selectedBracketSwapSlot.field === field
    );
}

function getSvgMatchBox(layout, roundIndex, matchIndex) {
    const step = layout.baseStep * (2 ** roundIndex);
    const centerY = layout.firstCenterY + ((2 ** roundIndex) - 1) * layout.baseStep / 2 + matchIndex * step;
    return {
        x: layout.paddingX + roundIndex * layout.columnWidth,
        y: centerY - layout.matchHeight / 2,
        width: layout.matchWidth,
        height: layout.matchHeight,
    };
}

function getBracketSvgLayout(rounds) {
    const paddingX = 44;
    const paddingBottom = 72;
    const headerHeight = 64;
    const titleY = 58;
    const roundTitleOffset = 24;
    const matchWidth = 248;
    const matchHeight = 112;
    const labelHeight = 22;
    const slotHeight = 30;
    const slotGap = 10;
    const slotWidth = matchWidth - 24;
    const seedWidth = 24;
    const baseGap = 28;
    const baseStep = matchHeight + baseGap;
    const firstCenterY = headerHeight + roundTitleOffset + matchHeight / 2;
    const firstRoundMatches = rounds[0]?.matches.length || 0;
    const bodyHeight = firstRoundMatches > 0
        ? firstRoundMatches * matchHeight + (firstRoundMatches - 1) * baseGap
        : matchHeight;
    const championWidth = 220;
    const championHeight = 92;
    const championY = headerHeight + roundTitleOffset + bodyHeight / 2 - championHeight / 2;
    const connectorReach = 18;
    const columnWidth = 320;
    const rightSafety = 56;
    const heightSafety = 36;
    const width = paddingX * 2 + rounds.length * columnWidth + championWidth + rightSafety;
    const height = Math.max(
        championY + championHeight + paddingBottom + heightSafety,
        headerHeight + roundTitleOffset + bodyHeight + paddingBottom + heightSafety
    );

    return {
        paddingX,
        titleY,
        matchWidth,
        matchHeight,
        labelHeight,
        slotHeight,
        slotGap,
        slotWidth,
        seedWidth,
        baseStep,
        firstCenterY,
        championWidth,
        championHeight,
        championY,
        connectorReach,
        columnWidth,
        width,
        height,
    };
}

function exportBracketPdf(tournament) {
    const bracket = tournament?.bracket;
    if (!bracket) {
        return;
    }

    const bracketMarkup = renderBracketMarkup(bracket, tournament);
    const exportHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(`${tournament.name} - ${tournament.category}`)} Bracket</title>
            <style>
                body {
                    margin: 0;
                    padding: 24px;
                    font-family: "Segoe UI", Arial, sans-serif;
                    background: #ffffff;
                    color: #111111;
                }
                .bracket-export {
                    overflow: visible;
                }
                .bracket-svg-wrap {
                    transform: none !important;
                    width: 100%;
                    background: #ffffff;
                }
                .bracket-svg {
                    width: 100%;
                    height: auto;
                }
                .svg-title,
                .svg-round-title,
                .svg-match-label,
                .svg-seed-text,
                .svg-slot-text,
                .svg-champion-name {
                    fill: #111111;
                }
                .svg-match-box,
                .svg-slot,
                .svg-seed-box,
                .svg-champion-box {
                    fill: #ffffff;
                    stroke: #bcbcbc;
                }
                .svg-connector {
                    stroke: #8f8f8f;
                }
                @page {
                    size: A4 landscape;
                    margin: 12mm;
                }
            </style>
        </head>
        <body>
            <div class="bracket-export">${bracketMarkup}</div>
            <script>
                window.addEventListener("load", () => {
                    window.print();
                });
            <\/script>
        </body>
        </html>
    `;

    const exportBlob = new Blob([exportHtml], { type: "text/html" });
    const exportUrl = URL.createObjectURL(exportBlob);
    const exportLink = document.createElement("a");
    exportLink.href = exportUrl;
    exportLink.target = "_blank";
    exportLink.rel = "noopener noreferrer";
    document.body.appendChild(exportLink);
    exportLink.click();
    exportLink.remove();
    setTimeout(() => URL.revokeObjectURL(exportUrl), 30000);
    setBracketStatus("PDF view opened. Use Save as PDF in the print dialog.");
}

function exportBracketCsv(tournament) {
    const rows = getBracketExportRows(tournament);
    const headers = ["Section", "Round", "Match", "Player A", "Player B", "Seed A", "Seed B", "Player A Note", "Player B Note"];
    const csv = [headers, ...rows]
        .map((row) => row.map(csvEscape).join(","))
        .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(`${tournament.name}-${tournament.category}`)}-bracket.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setBracketStatus("Bracket exported as CSV.");
}

function exportBracketExcel(tournament) {
    const workbook = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:x="urn:schemas-microsoft-com:office:excel"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8">
            <!--[if gte mso 9]>
            <xml>
                <x:ExcelWorkbook>
                    <x:ExcelWorksheets>
                        <x:ExcelWorksheet>
                            <x:Name>Bracket</x:Name>
                            <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
                        </x:ExcelWorksheet>
                    </x:ExcelWorksheets>
                </x:ExcelWorkbook>
            </xml>
            <![endif]-->
            <style>
                body { font-family: Arial, sans-serif; }
                .sheet-title { font-size: 18px; font-weight: 700; margin-bottom: 12px; }
                .section-title { font-size: 14px; font-weight: 700; margin: 18px 0 8px; }
                .bracket-sheet { border-collapse: separate; border-spacing: 8px 8px; }
                .bracket-sheet td { min-width: 190px; vertical-align: top; padding: 0; }
                .round-title { font-size: 12px; font-weight: 700; color: #516176; text-transform: uppercase; padding-bottom: 4px; }
                .pairing-cell { }
                .pairing-wrap { min-width: 190px; min-height: 76px; border: 2px solid transparent; border-radius: 12px; padding: 4px; }
                .pairing-wrap.pairing-active { border-color: #ff914d; background: #fff4eb; }
                .pairing-wrap.pairing-active.pairing-next { border-right-color: #d96f2f; }
                .pairing-wrap.pairing-active.pairing-fed { border-left-color: #d96f2f; }
                .match-cell { position: relative; }
                .match-cell.connector-right::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    right: -8px;
                    width: 8px;
                    border-top: 2px solid #ff914d;
                }
                .match-cell.connector-left::before {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: -8px;
                    width: 8px;
                    border-top: 2px solid #ff914d;
                }
                .match-card { border: 2px solid #ff914d; border-radius: 12px; padding: 8px; background: #fff7f1; }
                .match-label { font-size: 11px; font-weight: 700; color: #7b421d; margin-bottom: 6px; text-transform: uppercase; }
                .slot { border: 1px solid #f0c5a9; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px; background: #ffffff; font-size: 12px; color: #1b2430; }
                .slot:last-child { margin-bottom: 0; }
                .empty-cell { min-width: 190px; height: 76px; }
            </style>
        </head>
        <body>
            ${buildBracketExcelLayoutMarkup(tournament)}
        </body>
        </html>
    `;

    const blob = new Blob(["\ufeff", workbook], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(`${tournament.name}-${tournament.category}`)}-bracket.xls`;
    link.click();
    URL.revokeObjectURL(url);
    setBracketStatus("Bracket exported as Excel.");
}

function buildBracketExcelLayoutMarkup(tournament) {
    const bracket = tournament?.bracket;
    if (!bracket) {
        return "";
    }

    const sections = bracket.type === "double"
        ? [
            { title: "Winners Bracket", rounds: bracket.winners?.rounds || [] },
            { title: "Losers Bracket", rounds: bracket.losers?.rounds || [] },
            { title: "Finals", rounds: bracket.finals?.rounds || [] },
        ]
        : [
            { title: "Main Bracket", rounds: bracket.rounds || [] },
        ];

    return [
        `<div class="sheet-title">${escapeHtml(`${tournament.name} - ${tournament.category}`)}</div>`,
        ...sections.map((section) => buildBracketExcelSectionMarkup(section.title, section.rounds)),
    ].join("");
}

function buildBracketExcelSectionMarkup(sectionTitle, rounds) {
    if (!rounds.length) {
        return "";
    }

    const totalRows = getBracketExcelRowCount(rounds);
    const grid = Array.from({ length: totalRows }, () => Array.from({ length: rounds.length }, () => ""));

    rounds.forEach((round, roundIndex) => {
        round.matches.forEach((match, matchIndex) => {
            const rowIndex = getBracketExcelTopRow(roundIndex, matchIndex);
            if (rowIndex >= totalRows) {
                return;
            }
            const connectorClasses = [
                "match-cell",
                roundIndex > 0 ? "connector-left" : "",
                roundIndex < rounds.length - 1 ? "connector-right" : "",
            ].filter(Boolean).join(" ");
            grid[rowIndex][roundIndex] = `
                <div class="${connectorClasses}">
                    <div class="match-card">
                    <div class="match-label">${escapeHtml(match.displayLabel || match.label || "Match")}</div>
                    <div class="slot">${escapeHtml(formatBracketExcelSlot(match.slotA, match.seedA, match.byeA))}</div>
                    <div class="slot">${escapeHtml(formatBracketExcelSlot(match.slotB, match.seedB, match.byeB))}</div>
                    </div>
                </div>
            `;
        });
    });

    return `
        <div class="section-title">${escapeHtml(sectionTitle)}</div>
        <table class="bracket-sheet">
            <thead>
                <tr>
                    ${rounds.map((_, roundIndex) => `<td class="round-title">${escapeHtml(getBracketRoundLabel(roundIndex, rounds.length))}</td>`).join("")}
                </tr>
            </thead>
            <tbody>
                ${grid.map((row) => `
                    <tr>
                        ${row.map((cell, cellIndex) => {
                            const wrapClasses = [
                                "pairing-wrap",
                                cell ? "pairing-active" : "",
                                cell && cellIndex < row.length - 1 ? "pairing-next" : "",
                                cell && cellIndex > 0 ? "pairing-fed" : "",
                            ].filter(Boolean).join(" ");
                            return `<td class="pairing-cell"><div class="${wrapClasses}">${cell || '<div class="empty-cell"></div>'}</div></td>`;
                        }).join("")}
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function getBracketExcelRowCount(rounds) {
    let maxRow = 1;
    rounds.forEach((round, roundIndex) => {
        round.matches.forEach((_, matchIndex) => {
            const rowIndex = getBracketExcelTopRow(roundIndex, matchIndex);
            if (rowIndex > maxRow) {
                maxRow = rowIndex;
            }
        });
    });
    return maxRow + 1;
}

function getBracketExcelTopRow(roundIndex, matchIndex) {
    return (2 ** roundIndex - 1) + matchIndex * (2 ** (roundIndex + 1));
}

function formatBracketExcelSlot(label, seed, bye) {
    const prefix = seed ? `[${seed}] ` : "";
    const suffix = bye ? " (BYE)" : "";
    return `${prefix}${String(label || "TBD")}${suffix}`;
}

function getBracketExportRows(tournament) {
    const bracket = tournament?.bracket;
    if (!bracket) {
        return [];
    }

    if (bracket.type === "double") {
        return [
            ...flattenBracketSectionRows("Winners", bracket.winners?.rounds || []),
            ...flattenBracketSectionRows("Losers", bracket.losers?.rounds || []),
            ...flattenBracketSectionRows("Finals", bracket.finals?.rounds || []),
        ];
    }

    return flattenBracketSectionRows("Main", bracket.rounds || []);
}

function flattenBracketSectionRows(sectionLabel, rounds) {
    const totalRounds = rounds.length;
    const rows = [];

    rounds.forEach((round, roundIndex) => {
        round.matches.forEach((match) => {
            rows.push([
                sectionLabel,
                getBracketRoundLabel(roundIndex, totalRounds),
                String(match.label || ""),
                String(match.slotA || ""),
                String(match.slotB || ""),
                String(match.seedA || ""),
                String(match.seedB || ""),
                match.byeA ? "BYE" : "",
                match.byeB ? "BYE" : "",
            ]);
        });
    });

    return rows;
}

function renderBallotTournamentOptions() {
    if (!elements.ballotTournamentSelect) {
        return;
    }

    if (!Array.isArray(state.tournaments) || state.tournaments.length === 0) {
        elements.ballotTournamentSelect.innerHTML = '<option value="">No saved tournaments</option>';
        ballotTournamentId = "";
        return;
    }

    if (!ballotTournamentId || !state.tournaments.some((item) => item.id === ballotTournamentId)) {
        ballotTournamentId = state.tournaments[0].id;
    }

    elements.ballotTournamentSelect.innerHTML = state.tournaments
        .map((item) => {
            const label = `${item.name} - ${item.category}`;
            const selected = item.id === ballotTournamentId ? ' selected' : "";
            return `<option value="${item.id}"${selected}>${escapeHtml(label)}</option>`;
        })
        .join("");
}

function renderBallot() {
    if (!elements.ballotList) {
        return;
    }

    const currentTournament = state.tournaments.find((item) => item.id === ballotTournamentId);
    const ballotPlayers = getBallotPlayers();

    if (elements.ballotTournamentLabel) {
        elements.ballotTournamentLabel.textContent = currentTournament?.name || "-";
    }
    if (elements.ballotCategoryLabel) {
        elements.ballotCategoryLabel.textContent = currentTournament?.category || "-";
    }
    if (elements.ballotPlayerCount) {
        elements.ballotPlayerCount.textContent = String(ballotPlayers.length);
    }
    if (elements.ballotOrganizationCount) {
        elements.ballotOrganizationCount.textContent = String(
            new Set(ballotPlayers.map((team) => String(team.organization || "").trim()).filter(Boolean)).size
        );
    }

    if (!currentTournament) {
        elements.ballotList.innerHTML = '<tr><td colspan="6">Save a tournament first to prepare a ballot.</td></tr>';
        return;
    }

    if (ballotPlayers.length === 0) {
        elements.ballotList.innerHTML = '<tr><td colspan="6">No ballot entries available for the selected tournament.</td></tr>';
        return;
    }

    elements.ballotList.innerHTML = ballotPlayers
        .map(
            (team, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(getDisplayOrganization(team.organization) || "")}</td>
                    <td>${escapeHtml(team.name || "-")}</td>
                    <td>${escapeHtml(team.registrationNumber || "-")}</td>
                    <td>${escapeHtml(team.aadhar || "-")}</td>
                    <td>${escapeHtml(team.contact || "-")}</td>
                </tr>
            `
        )
        .join("");
}

function renderBracketTournamentOptions() {
    if (!elements.bracketTournamentSelect) {
        return;
    }

    if (!Array.isArray(state.tournaments) || state.tournaments.length === 0) {
        elements.bracketTournamentSelect.innerHTML = '<option value="">No saved tournaments</option>';
        bracketTournamentId = "";
        return;
    }

    if (!bracketTournamentId || !state.tournaments.some((item) => item.id === bracketTournamentId)) {
        bracketTournamentId = state.tournaments[0].id;
    }

    elements.bracketTournamentSelect.innerHTML = state.tournaments
        .map((item) => {
            const label = `${item.name} - ${item.category}`;
            const selected = item.id === bracketTournamentId ? ' selected' : "";
            return `<option value="${item.id}"${selected}>${escapeHtml(label)}</option>`;
        })
        .join("");
}

function renderBracket() {
    if (!elements.bracketRounds) {
        return;
    }

    if (elements.bracketZoomLabel) {
        elements.bracketZoomLabel.textContent = `${Math.round(bracketZoom * 100)}%`;
    }
    if (elements.bracketEditButton) {
        elements.bracketEditButton.classList.toggle("active", bracketEditMode);
        elements.bracketEditButton.textContent = bracketEditMode ? "Cancel edit" : "Edit bracket";
    }
    if (elements.bracketSaveButton) {
        elements.bracketSaveButton.disabled = !bracketEditMode || !bracketDirty;
    }

    const currentTournament = state.tournaments.find((item) => item.id === bracketTournamentId);
    const bracketPlayers = getBracketPlayers(currentTournament);
    const bracket = bracketEditMode && bracketDraft && currentTournament?.id === bracketTournamentId
        ? bracketDraft
        : (currentTournament?.bracket || null);

    elements.bracketPlayerCount.textContent = String(bracketPlayers.length);
    elements.bracketSizeCount.textContent = String(bracket?.size || 0);
    elements.bracketByeCount.textContent = String(bracket?.byes || 0);
    elements.bracketRoundCount.textContent = String(bracket?.rounds?.length || 0);

    if (!currentTournament) {
        elements.bracketRounds.innerHTML = "";
        setBracketStatus("Choose a saved tournament to prepare its bracket.");
        return;
    }

    if (!bracket) {
        elements.bracketRounds.innerHTML = "";
        setBracketStatus("Generate a bracket for the selected tournament.");
        return;
    }

    try {
        setBracketStatus(`Showing bracket for ${currentTournament.name} - ${currentTournament.category}.`);
        elements.bracketRounds.innerHTML = renderBracketMarkup(bracket, currentTournament);
        bindBracketSvgEditing();
    } catch (error) {
        elements.bracketRounds.innerHTML = '<div class="empty-state">Unable to render the bracket preview right now.</div>';
        setBracketStatus(`Bracket render error: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function renderBracketMarkup(bracket, tournament) {
    if (bracket?.type === "double") {
        return renderDoubleEliminationBracket(bracket, tournament);
    }
    return renderBracketSvg(bracket, tournament, {
        sectionKey: "main",
    });
}

function renderDoubleEliminationBracket(bracket, tournament) {
    return [
        '<div class="double-bracket-layout">',
        '<section class="double-bracket-panel">',
        '<div class="double-bracket-heading"><h3>Winners Bracket</h3><p>Primary knockout path</p></div>',
        renderBracketSvg(bracket.winners, tournament, {
            sectionKey: "winners",
            title: `${tournament.name} - Winners Bracket`,
            footerText: "Double elimination - winners side",
        }),
        '</section>',
        '<section class="double-bracket-panel">',
        '<div class="double-bracket-heading"><h3>Losers Bracket</h3><p>Second-chance path</p></div>',
        renderBracketSvg(bracket.losers, tournament, {
            sectionKey: "losers",
            title: `${tournament.name} - Losers Bracket`,
            footerText: "Double elimination - losers side",
        }),
        '</section>',
        '<section class="double-bracket-panel finals-panel">',
        '<div class="double-bracket-heading"><h3>Grand Final</h3><p>Includes reset match if needed</p></div>',
        renderBracketSvg(bracket.finals, tournament, {
            sectionKey: "finals",
            title: `${tournament.name} - Grand Final`,
            footerText: "Double elimination - finals",
        }),
        '</section>',
        '</div>',
    ].join("");
}

function renderMirroredSingleEliminationBracket(bracket, tournament) {
    if (!bracket?.rounds?.length || bracket.rounds.length < 2) {
        return renderBracketSvg(bracket, tournament, {
            sectionKey: "main",
        });
    }

    const sideRounds = bracket.rounds.slice(0, -1);
    const finalRound = bracket.rounds[bracket.rounds.length - 1];
    const firstRoundSideMatches = Math.max(1, Math.ceil((sideRounds[0]?.matches?.length || 2) / 2));
    const layout = getMirroredBracketLayout(sideRounds.length, firstRoundSideMatches);
    const title = `${tournament.name} - ${tournament.category}`;
    const parts = [
        `<div class="bracket-svg-wrap" style="--bracket-scale:${bracketZoom}; width:${layout.width * bracketZoom}px; height:${layout.height * bracketZoom}px;">`,
        `<svg class="bracket-svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="${escapeHtml(title)} bracket">`,
        `<rect x="0" y="0" width="${layout.width}" height="${layout.height}" rx="24" fill="#081321"></rect>`,
        `<text x="${layout.width / 2}" y="36" text-anchor="middle" class="svg-title">${escapeXml(title)}</text>`,
    ];

    sideRounds.forEach((round, roundIndex) => {
        const sideMatchCount = Math.ceil(round.matches.length / 2);
        const leftMatches = round.matches.slice(0, sideMatchCount);
        const rightMatches = round.matches.slice(sideMatchCount);

        leftMatches.forEach((match, matchIndex) => {
            renderMirroredBracketMatch(parts, layout, {
                match,
                roundIndex,
                matchIndex,
                side: "left",
                sectionKey: "main",
                totalSideRounds: sideRounds.length,
                isTowardFinal: roundIndex === sideRounds.length - 1,
            });
        });

        rightMatches.forEach((match, matchIndex) => {
            renderMirroredBracketMatch(parts, layout, {
                match,
                roundIndex,
                matchIndex,
                side: "right",
                sectionKey: "main",
                totalSideRounds: sideRounds.length,
                isTowardFinal: roundIndex === sideRounds.length - 1,
            });
        });
    });

    const finalMatch = finalRound?.matches?.[0];
    if (finalMatch) {
        const finalBox = getMirroredFinalMatchBox(layout);
        const topSlotY = finalBox.y + layout.labelHeight;
        const bottomSlotY = topSlotY + layout.slotHeight + layout.slotGap;
        const leftJoinX = finalBox.x;
        const rightJoinX = finalBox.x + finalBox.width;
        const topMidY = topSlotY + layout.slotHeight / 2;
        const bottomMidY = bottomSlotY + layout.slotHeight / 2;
        const mergeMidY = (topMidY + bottomMidY) / 2;

        parts.push(
            `<rect x="${finalBox.x}" y="${finalBox.y}" width="${finalBox.width}" height="${finalBox.height}" rx="18" class="svg-match-box"></rect>`,
            `<text x="${finalBox.x + 14}" y="${finalBox.y + 18}" class="svg-match-label">${escapeXml(finalMatch.displayLabel || finalMatch.label)}</text>`,
            renderSvgSlot(finalBox.x + 12, topSlotY, layout, finalMatch.seedA, getCompactBracketSlotLabel(finalMatch.slotA), finalMatch.byeA, bracket.rounds.length - 1, 0, "slotA", "main"),
            renderSvgSlot(finalBox.x + 12, bottomSlotY, layout, finalMatch.seedB, getCompactBracketSlotLabel(finalMatch.slotB), finalMatch.byeB, bracket.rounds.length - 1, 0, "slotB", "main")
        );

        const leftSemi = getMirroredMatchBox(layout, sideRounds.length - 1, 0, "left");
        const rightSemi = getMirroredMatchBox(layout, sideRounds.length - 1, 0, "right");
        const leftSourceY = leftSemi.y + layout.labelHeight + layout.slotHeight + layout.slotGap / 2;
        const rightSourceY = rightSemi.y + layout.labelHeight + layout.slotHeight + layout.slotGap / 2;

        parts.push(
            `<path d="M ${leftSemi.x + leftSemi.width} ${leftSourceY} L ${finalBox.x - 24} ${leftSourceY} L ${finalBox.x - 24} ${mergeMidY} L ${leftJoinX} ${mergeMidY}" class="svg-connector"></path>`,
            `<path d="M ${rightSemi.x} ${rightSourceY} L ${finalBox.x + finalBox.width + 24} ${rightSourceY} L ${finalBox.x + finalBox.width + 24} ${mergeMidY} L ${rightJoinX} ${mergeMidY}" class="svg-connector"></path>`
        );

        const championX = finalBox.x + (finalBox.width - layout.championWidth) / 2;
        parts.push(
            `<rect x="${championX}" y="${layout.championY}" width="${layout.championWidth}" height="${layout.championHeight}" rx="22" class="svg-champion-box"></rect>`,
            `<text x="${championX + 16}" y="${layout.championY + 24}" class="svg-match-label">Winner</text>`,
            `<text x="${championX + 16}" y="${layout.championY + 56}" class="svg-champion-name">${escapeXml(`Winner of ${finalMatch.label}`)}</text>`,
            `<path d="M ${finalBox.x + finalBox.width / 2} ${finalBox.y + finalBox.height} L ${finalBox.x + finalBox.width / 2} ${layout.championY - 16} L ${championX + layout.championWidth / 2} ${layout.championY - 16} L ${championX + layout.championWidth / 2} ${layout.championY}" class="svg-connector"></path>`
        );
    }

    parts.push(`</svg>`, `</div>`);
    return parts.join("");
}

function renderMirroredBracketMatch(parts, layout, options) {
    const {
        match,
        roundIndex,
        matchIndex,
        side,
        sectionKey,
        totalSideRounds,
        isTowardFinal,
    } = options;
    const matchBox = getMirroredMatchBox(layout, roundIndex, matchIndex, side);
    const topSlotY = matchBox.y + layout.labelHeight;
    const bottomSlotY = topSlotY + layout.slotHeight + layout.slotGap;
    const topMidY = topSlotY + layout.slotHeight / 2;
    const bottomMidY = bottomSlotY + layout.slotHeight / 2;
    const mergeMidY = (topMidY + bottomMidY) / 2;

    if (!match.isPlayable) {
        return;
    }

    parts.push(
        `<rect x="${matchBox.x}" y="${matchBox.y}" width="${matchBox.width}" height="${matchBox.height}" rx="18" class="svg-match-box"></rect>`,
        `<text x="${matchBox.x + 14}" y="${matchBox.y + 18}" class="svg-match-label">${escapeXml(match.displayLabel || match.label)}</text>`,
        renderSvgSlot(matchBox.x + 12, topSlotY, layout, match.seedA, getCompactBracketSlotLabel(match.slotA), match.byeA, roundIndex, matchIndex, "slotA", sectionKey),
        renderSvgSlot(matchBox.x + 12, bottomSlotY, layout, match.seedB, getCompactBracketSlotLabel(match.slotB), match.byeB, roundIndex, matchIndex, "slotB", sectionKey)
    );

    if (side === "left") {
        const mergeX = matchBox.x + matchBox.width + layout.connectorReach;
        parts.push(
            `<path d="M ${matchBox.x + matchBox.width} ${topMidY} L ${mergeX} ${topMidY} L ${mergeX} ${bottomMidY} L ${matchBox.x + matchBox.width} ${bottomMidY}" class="svg-connector"></path>`
        );

        if (!isTowardFinal) {
            const nextMatchBox = getMirroredMatchBox(layout, roundIndex + 1, Math.floor(matchIndex / 2), side);
            const nextCenterY = nextMatchBox.y + layout.labelHeight + layout.slotHeight + layout.slotGap / 2;
            parts.push(
                `<path d="M ${mergeX} ${mergeMidY} L ${nextMatchBox.x - 18} ${mergeMidY} L ${nextMatchBox.x - 18} ${nextCenterY} L ${nextMatchBox.x} ${nextCenterY}" class="svg-connector"></path>`
            );
        }
    } else {
        const mergeX = matchBox.x - layout.connectorReach;
        parts.push(
            `<path d="M ${matchBox.x} ${topMidY} L ${mergeX} ${topMidY} L ${mergeX} ${bottomMidY} L ${matchBox.x} ${bottomMidY}" class="svg-connector"></path>`
        );

        if (!isTowardFinal) {
            const nextMatchBox = getMirroredMatchBox(layout, roundIndex + 1, Math.floor(matchIndex / 2), side);
            const nextCenterY = nextMatchBox.y + layout.labelHeight + layout.slotHeight + layout.slotGap / 2;
            parts.push(
                `<path d="M ${mergeX} ${mergeMidY} L ${nextMatchBox.x + nextMatchBox.width + 18} ${mergeMidY} L ${nextMatchBox.x + nextMatchBox.width + 18} ${nextCenterY} L ${nextMatchBox.x + nextMatchBox.width} ${nextCenterY}" class="svg-connector"></path>`
            );
        }
    }
}

function getMirroredBracketLayout(sideRoundCount, firstRoundSideMatches) {
    const outerPaddingX = 112;
    const headerHeight = 56;
    const footerHeight = 220;
    const matchWidth = 182;
    const matchHeight = 82;
    const labelHeight = 18;
    const slotHeight = 20;
    const slotGap = 6;
    const slotWidth = matchWidth - 24;
    const seedWidth = 20;
    const connectorReach = 10;
    const centerGap = 28;
    const columnWidth = 220;
    const baseGap = 8;
    const baseStep = matchHeight + baseGap;
    const firstCenterY = headerHeight + matchHeight / 2;
    const championWidth = 156;
    const championHeight = 58;
    const width = outerPaddingX * 2 + sideRoundCount * columnWidth * 2 + centerGap + matchWidth + connectorReach * 8;
    const finalX = (width - matchWidth) / 2;
    const sideMatchBottom = getMirroredBracketMaxBottom(
        sideRoundCount,
        firstRoundSideMatches,
        firstCenterY,
        baseStep,
        matchHeight
    );
    const sideTopY = headerHeight;
    const sideBottomY = Math.max(sideMatchBottom, sideTopY + matchHeight);
    const sideBodyHeight = sideBottomY - sideTopY;
    const finalY = sideTopY + sideBodyHeight / 2 - matchHeight / 2;
    const championY = finalY + matchHeight + 36;
    const height = championY + championHeight + footerHeight;

    return {
        paddingX: outerPaddingX,
        width,
        height,
        headerHeight,
        matchWidth,
        matchHeight,
        labelHeight,
        slotHeight,
        slotGap,
        slotWidth,
        seedWidth,
        connectorReach,
        columnWidth,
        centerGap,
        baseStep,
        firstCenterY,
        finalX,
        finalY,
        championWidth,
        championHeight,
        championY,
    };
}

function getMirroredBracketMaxBottom(sideRoundCount, firstRoundSideMatches, firstCenterY, baseStep, matchHeight) {
    let maxBottom = firstCenterY + matchHeight / 2;

    for (let roundIndex = 0; roundIndex < sideRoundCount; roundIndex += 1) {
        const matchCount = Math.max(1, Math.ceil(firstRoundSideMatches / (2 ** roundIndex)));
        const lastMatchIndex = matchCount - 1;
        const step = baseStep * (2 ** roundIndex);
        const centerY = firstCenterY
            + ((2 ** roundIndex) - 1) * baseStep / 2
            + lastMatchIndex * step;
        const bottom = centerY + matchHeight / 2;
        if (bottom > maxBottom) {
            maxBottom = bottom;
        }
    }

    return maxBottom;
}

function getCompactBracketSlotLabel(label) {
    const text = String(label || "").trim();
    if (!text) {
        return "TBD";
    }

    const maxLength = 18;
    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength - 1).trim()}…`;
}

function getMirroredMatchBox(layout, roundIndex, matchIndex, side) {
    const step = layout.baseStep * (2 ** roundIndex);
    const centerY = layout.firstCenterY + ((2 ** roundIndex) - 1) * layout.baseStep / 2 + matchIndex * step;
    const inwardOffset = roundIndex * layout.columnWidth;
    const x = side === "left"
        ? layout.paddingX + inwardOffset
        : layout.width - layout.paddingX - layout.matchWidth - inwardOffset;

    return {
        x,
        y: centerY - layout.matchHeight / 2,
        width: layout.matchWidth,
        height: layout.matchHeight,
    };
}

function getMirroredFinalMatchBox(layout) {
    return {
        x: layout.finalX,
        y: layout.finalY,
        width: layout.matchWidth,
        height: layout.matchHeight,
    };
}

function bindBracketSvgEditing() {
    if (!elements.bracketRounds) {
        return;
    }

    elements.bracketRounds.querySelectorAll("[data-bracket-slot]").forEach((node) => {
        node.addEventListener("click", handleBracketSvgEdit);
    });
}

function handleBracketSvgEdit(event) {
    const target = event.target;
    const field = target.dataset.bracketSlot;
    const sectionKey = target.dataset.bracketSection || "main";
    const roundIndex = Number(target.dataset.roundIndex);
    const matchIndex = Number(target.dataset.matchIndex);
    const currentTournament = state.tournaments.find((item) => item.id === bracketTournamentId);

    if (!field || Number.isNaN(roundIndex) || Number.isNaN(matchIndex) || !currentTournament) {
        return;
    }

    if (!bracketEditMode || !bracketDraft) {
        setBracketStatus("Click Edit bracket to start swapping players.");
        return;
    }

    const sectionBracket = getBracketEditSection(bracketDraft, sectionKey);
    const match = sectionBracket?.rounds?.[roundIndex]?.matches?.[matchIndex];
    if (!match || !sectionBracket) {
        return;
    }

    handleBracketSlotSwap(sectionBracket, sectionKey, field, roundIndex, matchIndex);
}

function getBracketEditSection(bracket, sectionKey) {
    if (!bracket) {
        return null;
    }
    if (sectionKey === "winners") {
        return bracket.winners || null;
    }
    if (sectionKey === "losers") {
        return bracket.losers || null;
    }
    if (sectionKey === "finals") {
        return bracket.finals || null;
    }
    return bracket;
}

function handleBracketSlotSwap(bracket, sectionKey, field, roundIndex, matchIndex) {
    const currentSlot = { sectionKey, field, roundIndex, matchIndex };
    const currentMatch = bracket?.rounds?.[roundIndex]?.matches?.[matchIndex];
    if (!currentMatch) {
        return;
    }

    if (!selectedBracketSwapSlot) {
        selectedBracketSwapSlot = currentSlot;
        renderBracket();
        setBracketStatus(`First slot selected for swap: ${currentMatch.displayLabel || currentMatch.label}. Choose the second slot.`);
        return;
    }

    if (
        selectedBracketSwapSlot.sectionKey === currentSlot.sectionKey
        && selectedBracketSwapSlot.field === currentSlot.field
        && selectedBracketSwapSlot.roundIndex === currentSlot.roundIndex
        && selectedBracketSwapSlot.matchIndex === currentSlot.matchIndex
    ) {
        selectedBracketSwapSlot = null;
        renderBracket();
        setBracketStatus("Swap selection cleared.");
        return;
    }

    if (selectedBracketSwapSlot.sectionKey !== currentSlot.sectionKey) {
        setBracketStatus("Please swap players within the same bracket section.");
        selectedBracketSwapSlot = null;
        renderBracket();
        return;
    }

    const firstMatch = bracket?.rounds?.[selectedBracketSwapSlot.roundIndex]?.matches?.[selectedBracketSwapSlot.matchIndex];
    if (!firstMatch) {
        selectedBracketSwapSlot = null;
        renderBracket();
        return;
    }

    const firstField = selectedBracketSwapSlot.field;
    const firstByeField = firstField === "slotA" ? "byeA" : "byeB";
    const secondByeField = field === "slotA" ? "byeA" : "byeB";
    const firstSeedField = firstField === "slotA" ? "seedA" : "seedB";
    const secondSeedField = field === "slotA" ? "seedA" : "seedB";

    const firstValue = firstMatch[firstField];
    const firstBye = Boolean(firstMatch[firstByeField]);
    const firstSeed = firstMatch[firstSeedField];

    firstMatch[firstField] = currentMatch[field];
    firstMatch[firstByeField] = Boolean(currentMatch[secondByeField]);
    firstMatch[firstSeedField] = currentMatch[secondSeedField];
    currentMatch[field] = firstValue;
    currentMatch[secondByeField] = firstBye;
    currentMatch[secondSeedField] = firstSeed;

    bracketDirty = true;
    selectedBracketSwapSlot = null;
    renderBracket();
    setBracketStatus("Players swapped. Review the bracket and click Save bracket to keep the changes.");
}

function renderFilterCategoryOptions() {
    if (!elements.filterCategorySelect) {
        return;
    }

    if (tournamentMode === "edit" && activeTournamentId) {
        const tournamentCategory = String(state.tournament.category || "").trim();
        elements.filterCategorySelect.innerHTML = tournamentCategory
            ? `<option value="${escapeHtml(tournamentCategory)}" selected>${escapeHtml(tournamentCategory)}</option>`
            : '<option value="">Selected tournament category</option>';
        elements.filterCategorySelect.value = tournamentCategory;
        return;
    }

    const currentValue = elements.filterCategorySelect.value;
    const categories = getAvailableCategories();
    elements.filterCategorySelect.innerHTML = ['<option value="">All Categories</option>']
        .concat(
            categories.map((category) => {
                const selected = category === currentValue ? ' selected' : "";
                return `<option value="${escapeHtml(category)}"${selected}>${escapeHtml(category)}</option>`;
            })
        )
        .join("");
}

function renderFilterOrganizationOptions() {
    if (!elements.filterOrganizationSelect) {
        return;
    }

    const organizations = tournamentMode === "edit" && activeTournamentId
        ? Array.from(
            new Set(getCurrentTournamentRecordPlayers().map((team) => String(team.organization || "").trim()).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b))
        : getAvailableOrganizations();
    const currentValue = elements.filterOrganizationSelect.value;
    elements.filterOrganizationSelect.innerHTML = ['<option value="">All Organizations</option>']
        .concat(
            organizations.map((organization) => {
                const selected = organization === currentValue ? ' selected' : "";
                return `<option value="${escapeHtml(organization)}"${selected}>${escapeHtml(organization)}</option>`;
            })
        )
        .join("");
}

function renderSummary() {
    elements.summaryTournament.textContent = String(state.tournaments.length);
    elements.summaryTeams.textContent = String(state.teams.length);
    elements.summaryMatches.textContent = String(state.matches.length);
}

function renderOverview() {
    const completed = state.matches.filter(isMatchCompleted).length;
    const hasTournament = Boolean(state.tournament.name);
    const tournamentPlayers = getTournamentPlayers();
    elements.overviewTournament.textContent = state.tournament.name || "Not created yet";
    elements.overviewStage.textContent = state.tournament.category || "Not set";
    elements.overviewTeams.textContent = String(tournamentPlayers.length);
    elements.overviewCompleted.textContent = String(completed);
    elements.overviewRoundCard.style.display = hasTournament ? "" : "none";
    elements.overviewPlayersCard.style.display = hasTournament ? "" : "none";
    elements.overviewCompletedCard.style.display = hasTournament ? "" : "none";

    elements.overviewTournamentList.innerHTML = "";
    if (state.tournaments.length === 0) {
        elements.overviewTournamentList.innerHTML = '<tr><td colspan="6">No tournaments saved yet.</td></tr>';
        return;
    }

    elements.overviewUpcoming.innerHTML = upcoming
        .map((match) => {
            const title = `${escapeHtml(getTeamName(match.teamA))} vs ${escapeHtml(getTeamName(match.teamB))}`;
            const meta = [match.round, formatDateTime(match.date, match.time)].filter(Boolean).join(" • ");
            return `<div class="item-card"><div><h3 class="item-title">${title}</h3><p class="item-subtitle">${escapeHtml(meta)}</p></div></div>`;
        })
        .join("");
}

function renderOverview() {
    const completed = state.matches.filter(isMatchCompleted).length;
    const hasTournament = Boolean(state.tournament.name);
    const tournamentPlayers = getTournamentPlayers();
    elements.overviewTournamentCount.textContent = String(state.tournaments.length);
    elements.overviewStage.textContent = state.tournament.category || "Not set";
    elements.overviewTeams.textContent = String(tournamentPlayers.length);
    elements.overviewCompleted.textContent = String(completed);
    elements.overviewRoundCard.style.display = hasTournament ? "" : "none";
    elements.overviewPlayersCard.style.display = hasTournament ? "" : "none";
    elements.overviewCompletedCard.style.display = hasTournament ? "" : "none";
    elements.overviewTournamentList.innerHTML = "";

    if (state.tournaments.length === 0) {
        elements.overviewTournamentList.innerHTML = '<tr><td colspan="6">No tournaments saved yet.</td></tr>';
        return;
    }

    elements.overviewTournamentList.innerHTML = state.tournaments
        .map(
            (item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(item.name)}</td>
                    <td>${escapeHtml(item.category)}</td>
                    <td>${escapeHtml(item.format)}</td>
                    <td>${item.playerCount}</td>
                    <td>${escapeHtml(item.notes || "-")}</td>
                </tr>
            `
        )
        .join("");
}

function renderTeams() {
    if (tournamentMode === "edit" && !activeTournamentId) {
        elements.teamsList.innerHTML = '<tr><td colspan="8">Choose a saved tournament to view its entries.</td></tr>';
        return;
    }

    const categoryFilter = tournamentMode === "edit" && activeTournamentId
        ? String(state.tournament.category || "").trim()
        : (elements.filterCategorySelect?.value || "");
    const organizationFilter = elements.filterOrganizationSelect?.value || "";
    const basePlayers = tournamentMode === "edit" ? state.teams : state.teams;
    const allPlayers = basePlayers.filter((team) => {
        const matchesCategory = !categoryFilter || String(team.category || "").trim() === categoryFilter;
        const matchesOrganization = !organizationFilter || String(team.organization || "").trim() === organizationFilter;
        return matchesCategory && matchesOrganization;
    });

    elements.teamsList.innerHTML = "";
    if (allPlayers.length === 0) {
        elements.teamsList.innerHTML = tournamentMode === "edit"
            ? '<tr><td colspan="8">No entries are available for this tournament yet.</td></tr>'
            : '<tr><td colspan="8">No players match the current filters.</td></tr>';
        return;
    }

    allPlayers.forEach((team, index) => {
        const fragment = elements.teamCardTemplate.content.cloneNode(true);
        const row = fragment.querySelector(".player-row");
        const identityKey = buildPlayerIdentityKey(team);
        if (Array.isArray(state.importMeta.duplicateKeys) && state.importMeta.duplicateKeys.includes(identityKey)) {
            row.classList.add("highlight-duplicate");
        }
        fragment.querySelector(".player-serial").textContent = String(index + 1);
        fragment.querySelector(".item-title").textContent = team.name || "-";
        fragment.querySelector(".player-reg").textContent = team.registrationNumber || "-";
        fragment.querySelector(".player-aadhar").textContent = team.aadhar || "-";
        fragment.querySelector(".player-org").textContent = getDisplayOrganization(team.organization) || "";
        fragment.querySelector(".player-category").textContent = team.category || "-";
        fragment.querySelector(".player-contact").textContent = team.contact || "-";
        fragment.querySelector(".remove-team").addEventListener("click", () => {
            state.teams = state.teams.filter((item) => item.id !== team.id);
            state.matches = state.matches.filter((match) => match.teamA !== team.id && match.teamB !== team.id);
            persist();
            renderAll();
        });
        elements.teamsList.appendChild(fragment);
    });
}

function renderStandings() {
    const selectedCategory = elements.standingsCategory?.value || state.tournament.category || "";
    const tournamentPlayers = getPlayersByCategory(selectedCategory);
    const tournamentLabel = selectedCategory
        ? `${state.tournament.name || "Selected category"} - ${selectedCategory}`
        : "";

    if (elements.standingsContext) {
        elements.standingsContext.textContent = tournamentLabel
            ? `Showing rankings for ${tournamentLabel}`
            : "Choose a category to view rankings.";
    }

    const allowedIds = new Set(tournamentPlayers.map((team) => team.id));
    const standings = tournamentPlayers.map((team) => {
        let wins = 0;
        state.matches.forEach((match) => {
            if (
                !isMatchCompleted(match) ||
                !allowedIds.has(match.teamA) ||
                !allowedIds.has(match.teamB) ||
                (match.teamA !== team.id && match.teamB !== team.id)
            ) {
                return;
            }
            const scoreA = Number(match.scoreA);
            const scoreB = Number(match.scoreB);

            if (match.teamA === team.id) {
                if (scoreA > scoreB) wins += 1;
            } else {
                if (scoreB > scoreA) wins += 1;
            }
        });

        return {
            name: team.name,
            wins,
        };
    });

    standings.sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name));

    if (standings.length === 0) {
        elements.standingsTable.innerHTML = selectedCategory
            ? '<tr><td colspan="3">No players found for the selected rankings category.</td></tr>'
            : '<tr><td colspan="3">Choose a category to view rankings.</td></tr>';
        return;
    }

    elements.standingsTable.innerHTML = standings
        .map((row, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(row.name)}</td><td>${row.wins}</td></tr>`)
        .join("");
}

function renderStandingsCategoryOptions() {
    if (!elements.standingsCategory) {
        return;
    }

    const categories = getAvailableCategories();
    const selectedCategory = elements.standingsCategory.value || state.tournament.category || "";
    elements.standingsCategory.innerHTML = categories.length > 0
        ? categories
            .map((category) => {
                const selected = category === selectedCategory ? ' selected' : "";
                return `<option value="${escapeHtml(category)}"${selected}>${escapeHtml(category)}</option>`;
            })
            .join("")
        : '<option value="">Import players to load categories</option>';

    if (categories.length > 0 && !selectedCategory) {
        elements.standingsCategory.selectedIndex = 0;
    }
}

function renderAnnouncements() {
    elements.announcementsList.innerHTML = "";
    if (state.announcements.length === 0) {
        elements.announcementsList.innerHTML = '<div class="empty-state">No announcements posted yet.</div>';
        return;
    }

    state.announcements.forEach((entry) => {
        const fragment = elements.announcementTemplate.content.cloneNode(true);
        fragment.querySelector(".announcement-copy").textContent = entry.message;
        fragment.querySelector(".remove-announcement").addEventListener("click", () => {
            state.announcements = state.announcements.filter((item) => item.id !== entry.id);
            persist();
            renderAll();
        });
        elements.announcementsList.appendChild(fragment);
    });
}

function renderDetectedCategories() {
    const categories = getAvailableCategories();
    elements.detectedCategories.textContent = categories.length > 0
        ? `Detected categories: ${categories.join(", ")}`
        : "Detected categories: none";
}

function renderSkippedEntries() {
    const duplicateEntries = Array.isArray(state.importMeta.duplicateEntries) ? state.importMeta.duplicateEntries : [];
    const invalidEntries = Array.isArray(state.importMeta.invalidEntries) ? state.importMeta.invalidEntries : [];

    if (elements.duplicateEntriesSection) {
        elements.duplicateEntriesSection.style.display = duplicateEntries.length > 0 ? "" : "none";
    }
    if (elements.invalidEntriesSection) {
        elements.invalidEntriesSection.style.display = invalidEntries.length > 0 ? "" : "none";
    }

    elements.duplicateEntriesList.innerHTML = duplicateEntries.length === 0
        ? '<tr><td colspan="7">No duplicate entries in the latest import.</td></tr>'
        : duplicateEntries
            .map(
                (entry, index) => `
                    <tr class="highlight-duplicate">
                        <td>${index + 1}</td>
                        <td>${escapeHtml(entry.name || "-")}</td>
                        <td>${escapeHtml(entry.registrationNumber || "-")}</td>
                        <td>${escapeHtml(entry.aadhar || "-")}</td>
                        <td>${escapeHtml(entry.organization || "-")}</td>
                        <td>${escapeHtml(entry.category || "-")}</td>
                        <td>${escapeHtml(entry.reason || "-")}</td>
                    </tr>
                `
            )
            .join("");

    elements.invalidEntriesList.innerHTML = invalidEntries.length === 0
        ? '<tr><td colspan="7">No invalid or missed entries in the latest import.</td></tr>'
        : invalidEntries
            .map(
                (entry, index) => `
                    <tr class="highlight-invalid">
                        <td>${index + 1}</td>
                        <td>${escapeHtml(entry.name || "-")}</td>
                        <td>${escapeHtml(entry.registrationNumber || "-")}</td>
                        <td>${escapeHtml(entry.aadhar || "-")}</td>
                        <td>${escapeHtml(entry.organization || "-")}</td>
                        <td>${escapeHtml(entry.category || "-")}</td>
                        <td>${escapeHtml(entry.reason || "-")}</td>
                    </tr>
                `
            )
            .join("");
}

function setImportStatus(message) {
    elements.importStatus.textContent = message;
}

function setManualPlayerStatus(message) {
    if (elements.manualPlayerStatus) {
        elements.manualPlayerStatus.textContent = message;
    }
}

function setTournamentSaveStatus(message) {
    if (elements.tournamentSaveStatus) {
        elements.tournamentSaveStatus.textContent = message;
    }
}

function setTournamentModeStatus(message) {
    if (elements.tournamentModeStatus) {
        elements.tournamentModeStatus.textContent = message;
        elements.tournamentModeStatus.style.display = message ? "" : "none";
    }
}

function setBracketStatus(message) {
    if (elements.bracketStatus) {
        elements.bracketStatus.textContent = message;
    }
}

function normalizeImportMeta(importMeta) {
    return {
        categories: Array.isArray(importMeta?.categories) ? cloneState(importMeta.categories) : [],
        duplicateEntries: Array.isArray(importMeta?.duplicateEntries) ? cloneState(importMeta.duplicateEntries) : [],
        invalidEntries: Array.isArray(importMeta?.invalidEntries) ? cloneState(importMeta.invalidEntries) : [],
        duplicateKeys: Array.isArray(importMeta?.duplicateKeys) ? cloneState(importMeta.duplicateKeys) : [],
    };
}

function normalizeTeams(teams) {
    return Array.isArray(teams)
        ? teams.map((team) => ({
            id: team.id || createId(),
            name: team.name || "",
            contact: team.contact || "",
            registrationNumber: team.registrationNumber || "",
            aadhar: team.aadhar || "",
            organization: team.organization || "",
            category: team.category || "",
            source: team.source || "",
        }))
        : [];
}

function isMatchCompleted(match) {
    return match.scoreA !== "" && match.scoreB !== "";
}

function getTeamName(teamId) {
    const team = state.teams.find((item) => item.id === teamId);
    return team ? team.name : "Unknown team";
}

function formatDateTime(date, time) {
    return [date, time].filter(Boolean).join(" ");
}

function loadState() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return cloneState(defaultState);
    }

    try {
        const parsed = JSON.parse(raw);
        return {
            tournament: {
                name: parsed.tournament?.name || "",
                format: parsed.tournament?.format || "League",
                category: parsed.tournament?.category || "",
                notes: parsed.tournament?.notes || "",
            },
            tournaments: Array.isArray(parsed.tournaments)
                ? parsed.tournaments.map((item) => ({
                    id: item.id || createId(),
                    name: item.name || "",
                    format: item.format || "League",
                    category: item.category || "",
                    notes: item.notes || "",
                    playerCount: Number(item.playerCount || 0),
                    teams: normalizeTeams(item.teams),
                    importMeta: normalizeImportMeta(item.importMeta),
                    matches: Array.isArray(item.matches) ? item.matches : [],
                    announcements: Array.isArray(item.announcements) ? item.announcements : [],
                    bracket: normalizeBracketState(item.bracket),
                }))
                : [],
            importMeta: normalizeImportMeta(parsed.importMeta),
            teams: normalizeTeams(parsed.teams),
            matches: Array.isArray(parsed.matches) ? parsed.matches : [],
            announcements: Array.isArray(parsed.announcements) ? parsed.announcements : [],
        };
    } catch {
        return cloneState(defaultState);
    }
}

function normalizeBracketState(bracket) {
    if (!bracket) {
        return null;
    }

    if (bracket.type === "double") {
        return {
            type: "double",
            size: Number(bracket.size || 0),
            byes: Number(bracket.byes || 0),
            winners: {
                size: Number(bracket.winners?.size || 0),
                byes: Number(bracket.winners?.byes || 0),
                rounds: Array.isArray(bracket.winners?.rounds) ? cloneState(bracket.winners.rounds) : [],
            },
            losers: {
                size: Number(bracket.losers?.size || 0),
                byes: Number(bracket.losers?.byes || 0),
                rounds: Array.isArray(bracket.losers?.rounds) ? cloneState(bracket.losers.rounds) : [],
            },
            finals: {
                size: Number(bracket.finals?.size || 0),
                byes: Number(bracket.finals?.byes || 0),
                rounds: Array.isArray(bracket.finals?.rounds) ? cloneState(bracket.finals.rounds) : [],
            },
            rounds: Array.isArray(bracket.rounds) ? cloneState(bracket.rounds) : [],
            nextMatchSequence: Number(bracket.nextMatchSequence || 1),
        };
    }

    return {
        type: "single",
        size: Number(bracket.size || 0),
        byes: Number(bracket.byes || 0),
        rounds: Array.isArray(bracket.rounds) ? cloneState(bracket.rounds) : [],
        nextMatchSequence: Number(bracket.nextMatchSequence || 1),
    };
}

function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const next = text[index + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                value += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === "," && !inQuotes) {
            row.push(value);
            value = "";
            continue;
        }

        if ((char === "\n" || char === "\r") && !inQuotes) {
            if (char === "\r" && next === "\n") {
                index += 1;
            }
            row.push(value);
            if (row.some((cell) => cell.trim() !== "")) {
                rows.push(row);
            }
            row = [];
            value = "";
            continue;
        }

        value += char;
    }

    if (value !== "" || row.length > 0) {
        row.push(value);
        if (row.some((cell) => cell.trim() !== "")) {
            rows.push(row);
        }
    }

    return rows;
}

function findHeaderIndex(headers, options) {
    return headers.findIndex((header) => options.includes(header));
}

function getAvailableCategories() {
    return Array.from(
        new Set(
            [
                ...state.teams.map((team) => String(team.category || "").trim()),
                ...state.importMeta.categories.map((category) => String(category || "").trim()),
            ].filter(Boolean)
        )
    ).sort((a, b) => a.localeCompare(b));
}

function getAvailableOrganizations() {
    return Array.from(
        new Set(state.teams.map((team) => getDisplayOrganization(team.organization)).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
}

function getBracketPlayers(tournament) {
    if (!tournament) {
        return [];
    }

    const tournamentCategory = String(tournament.category || "").trim();
    return normalizeTeams(tournament.teams)
        .filter((team) => String(team.category || "").trim() === tournamentCategory)
        .sort((a, b) =>
            getDisplayOrganization(a.organization).localeCompare(getDisplayOrganization(b.organization))
            || String(a.name || "").localeCompare(String(b.name || ""))
        );
}

function getBallotPlayers() {
    const currentTournament = state.tournaments.find((item) => item.id === ballotTournamentId);
    if (!currentTournament) {
        return [];
    }

    const tournamentCategory = String(currentTournament.category || "").trim();
    return normalizeTeams(currentTournament.teams)
        .filter((team) => String(team.category || "").trim() === tournamentCategory)
        .sort((a, b) =>
            getDisplayOrganization(a.organization).localeCompare(getDisplayOrganization(b.organization))
            || String(a.name || "").localeCompare(String(b.name || ""))
        );
}

function getBracketSize(entryCount) {
    let size = 1;
    while (size < entryCount) {
        size *= 2;
    }
    return size;
}

function getTournamentPlayers() {
    return state.teams.filter(
        (team) => String(team.category || "").trim() === state.tournament.category
    );
}

function getCurrentTournamentRecordPlayers() {
    const currentTournament = state.tournaments.find((item) => item.id === activeTournamentId);
    const sourceTeams = currentTournament ? normalizeTeams(currentTournament.teams) : normalizeTeams(state.teams);
    const tournamentCategory = String(currentTournament?.category || state.tournament.category || "").trim();

    return sourceTeams.filter(
        (team) => String(team.category || "").trim() === tournamentCategory
    );
}

function getPlayersByCategory(category) {
    const normalizedCategory = String(category || "").trim();
    if (!normalizedCategory) {
        return [];
    }

    return state.teams.filter(
        (team) => String(team.category || "").trim() === normalizedCategory
    );
}

function getFilteredPlayers() {
    const category = elements.filterCategorySelect?.value || "";
    const organization = elements.filterOrganizationSelect?.value || "";

    return state.teams.filter((team) => {
        const matchesCategory = !category || String(team.category || "").trim() === category;
        const matchesOrganization = !organization || String(team.organization || "").trim() === organization;
        return matchesCategory && matchesOrganization;
    });
}

function exportPlayersCsv(players, fileName) {
    const headers = ["S.No", "Player", "Registration No.", "Aadhar", "Organization", "Category", "Contact"];
    const rows = players.map((team, index) => [
        String(index + 1),
        team.name || "",
        team.registrationNumber || "",
        team.aadhar || "",
        team.organization || "",
        team.category || "",
        team.contact || "",
    ]);

    const csv = [headers, ...rows]
        .map((row) => row.map(csvEscape).join(","))
        .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}

function exportSkippedCsv(entries, fileName) {
    const headers = ["S.No", "Player", "Registration No.", "Aadhar", "Organization", "Category", "Reason"];
    const rows = entries.map((entry, index) => [
        String(index + 1),
        entry.name || "",
        entry.registrationNumber || "",
        entry.aadhar || "",
        entry.organization || "",
        entry.category || "",
        entry.reason || "",
    ]);

    const csv = [headers, ...rows]
        .map((row) => row.map(csvEscape).join(","))
        .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}

function csvEscape(value) {
    const text = String(value ?? "");
    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
        return `"${text.replaceAll('"', '""')}"`;
    }
    return text;
}

function slugify(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "all";
}

function getDisplayOrganization(value) {
    const organization = String(value || "").trim();
    if (!organization) {
        return "";
    }
    const normalized = organization.toLowerCase().replace(/\s+/g, " ");
    const otherLikeValues = [
        "others",
        "other",
    ];
    const otherLikePhrases = [
        "if not belonging to above institutions",
        "if not belonging to above institution",
        "not belonging to above institutions",
        "not belonging to above institution",
    ];

    if (otherLikeValues.includes(normalized)) {
        return "";
    }

    if (otherLikePhrases.some((phrase) => normalized.includes(phrase))) {
        return "";
    }

    return organization;
}

function formatBracketPlayerLabel(player) {
    const name = String(player?.name || "").trim() || "TBD";
    const organization = getBracketOrganizationLabel(player?.organization);
    return organization ? `${name} - ${organization}` : name;
}

function addByeNoteToLabel(label) {
    const text = String(label || "").trim();
    if (!text) {
        return "BYE";
    }
    return text.includes("(BYE)") ? text : `${text} (BYE)`;
}

function getBracketOrganizationLabel(value) {
    const organization = getDisplayOrganization(value);
    if (!organization) {
        return "";
    }

    const acronymMatch = organization.match(/\(([^)]+)\)\s*$/);
    if (acronymMatch) {
        return acronymMatch[1].trim();
    }

    const words = organization
        .replace(/[()]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
    if (words.length === 0) {
        return "";
    }

    if (words.length === 1) {
        return words[0].slice(0, 10);
    }

    const acronym = words
        .filter((word) => /[A-Za-z]/.test(word))
        .map((word) => word[0].toUpperCase())
        .join("");

    return acronym || organization.slice(0, 10);
}

function formatCategoryList(values) {
    const items = Array.from(values).filter(Boolean);
    return items.length > 0 ? items.join(", ") : "none";
}

function buildPlayerIdentityKey(player) {
    const registrationNumber = normalizeIdentityValue(player.registrationNumber);
    const aadhar = normalizeIdentityValue(player.aadhar);
    const organization = normalizeIdentityValue(player.organization);
    const category = normalizeIdentityValue(player.category);

    if (!organization || !category || (!registrationNumber && !aadhar)) {
        return "";
    }

    return [registrationNumber || "none", aadhar || "none", organization, category].join("|");
}

function normalizeIdentityValue(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function normalizeHeader(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[\s/]+/g, " ")
        .replace(/[():.'’,-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function persist() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function cloneState(value) {
    return JSON.parse(JSON.stringify(value));
}

function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function escapeXml(value) {
    return escapeHtml(value);
}

function renderOverviewFixed() {
    if (!elements.overviewTournamentList) {
        return;
    }

    if (elements.overviewTournamentCount) {
        elements.overviewTournamentCount.textContent = String(state.tournaments.length);
    }

    elements.overviewTournamentList.innerHTML = "";

    if (!Array.isArray(state.tournaments) || state.tournaments.length === 0) {
        elements.overviewTournamentList.innerHTML = '<tr><td colspan="6">No tournaments saved yet.</td></tr>';
        return;
    }

    elements.overviewTournamentList.innerHTML = state.tournaments
        .map(
            (item, index) => {
                const tournamentTotalPlayers = state.tournaments
                    .filter((entry) => entry.name === item.name)
                    .reduce((total, entry) => total + Number(entry.playerCount || 0), 0);

                return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${escapeHtml(item.name || "-")}</td>
                    <td>${escapeHtml(item.category || "-")}</td>
                    <td>${escapeHtml(item.format || "-")}</td>
                    <td>${tournamentTotalPlayers}</td>
                    <td>${escapeHtml(item.notes || "-")}</td>
                </tr>
            `;
            }
        )
        .join("");
}
